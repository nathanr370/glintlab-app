import { NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import path from "path"
import fs from "fs"
import csv from "csv-parser"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { type, title, font_style, color_map, color_palette, y_col, exclude_ids, show_stats, optionsOnly, letter_groups } = body
  const scriptMap: Record<string, { script: string, args?: string[] }> = {
    heatmap: { script: "scripts/Heatmap_TMA.py" },
    box_and_scatter: { script: "scripts/BoxPlot_Area.py", args: ["--show_scatter", "True"] },
    box_whisker: { script: "scripts/BoxPlot_Area.py", args: ["--show_scatter", "False"] },
    histogram: { script: "scripts/create_histogram.py" },
  }
  const entry = scriptMap[type]
  if (!entry) return NextResponse.json({ error: "Unknown type" }, { status: 400 })

  // If optionsOnly is true, return unique row letters and col numbers from the data
  if ((type === "heatmap" || type === "box_and_scatter" || type === "box_whisker" || type === "histogram") && optionsOnly) {
    const dataDir = path.join(process.cwd(), "data")
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.csv'))
    if (!files.length) return NextResponse.json({ error: "No data file found" }, { status: 500 })
    const filePath = path.join(dataDir, files[0])
    if (type === "heatmap") {
      // Only for heatmap: return rowLetters and colNumbers
      const rowSet = new Set<string>()
      const colSet = new Set<string>()
      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => {
            const sample = Object.values(row)[0]
            if (typeof sample === 'string') {
              for (const letter of sample.replace(/[^A-Za-z]/g, '').toUpperCase()) {
                rowSet.add(letter)
              }
              const numberMatches = sample.match(/[0-9]+/g)
              if (numberMatches) {
                for (const num of numberMatches) {
                  colSet.add(num)
                }
              }
            }
          })
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
      })
      return NextResponse.json({
        rowLetters: Array.from(rowSet).sort(),
        colNumbers: Array.from(colSet).sort((a, b) => Number(a) - Number(b)),
      })
    } else if (type === "box_and_scatter" || type === "box_whisker") {
      // Only for boxplot: return columns (CSV header titles except 'sample' and 'group')
      const columns = await new Promise<string[]>((resolve, reject) => {
        let headerProcessed = false;
        let filteredCols: string[] = [];
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('headers', (headers: string[]) => {
            filteredCols = headers
              .map(col => col.replace(/[. ]+/g, '_')) // normalize
              .filter((col: string) => typeof col === 'string' && !["sample", "group"].includes(col.toLowerCase()));
            headerProcessed = true;
          })
          .on('end', () => {
            if (headerProcessed) {
              resolve(filteredCols);
            } else {
              resolve([]);
            }
          })
          .on('error', (err) => reject(err))
      });
      return NextResponse.json({ columns });
    } else if (type === "histogram") {
      // For histogram: return all unique first letters from the first column as letterGroups
      const letterSet = new Set();
      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => {
            const sample = Object.values(row)[0];
            if (typeof sample === 'string' && sample.length > 0) {
              const letter = sample[0].toUpperCase();
              if (letter.match(/[A-Z]/)) letterSet.add(letter);
            }
          })
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
      });
      return NextResponse.json({ letterGroups: Array.from(letterSet).sort() });
    }
  }

  let command = `python3 ${entry.script}`
  if (entry.args) command += " " + entry.args.join(" ")

  // Add heatmap parameters as CLI args if present
  if (type === "heatmap") {
    if (title) command += ` --title \"${title.replace(/"/g, '\"')}\"`
    if (font_style) command += ` --font_style \"${font_style}\"`
    if (color_map) command += ` --color_map \"${color_map}\"`
    if (Array.isArray(exclude_ids) && exclude_ids.length > 0) command += ` --exclude_ids \"${exclude_ids.join(",")}\"`
    if (show_stats !== undefined) command += ` --show_stats ${show_stats}`
  }

  // Add boxplot parameters as CLI args if present
  if (type === "box_and_scatter" || type === "box_whisker") {
    command += ` --group_by Group --dataType Area`;
    if (title) command += ` --title \"${title.replace(/"/g, '\"')}\"`
    if (font_style) command += ` --font_style \"${font_style}\"`
    if (color_palette) command += ` --color_palette \"${color_palette}\"`
    if (y_col) command += ` --y_col \"${y_col}\"`
  }

  // Add histogram parameters as CLI args if present
  if (type === "histogram") {
    if (title) command += ` --title \"${title.replace(/"/g, '\"')}\"`
    if (font_style) command += ` --font_style \"${font_style}\"`
    if (color_map) command += ` --color_map \"${color_map}\"`
    if (Array.isArray(letter_groups) && letter_groups.length > 0) command += ` --letter_groups \"${letter_groups.join(",")}\"`
  }

  // Run the script and capture base64 image from stdout
  return new Promise((resolve) => {
    exec(command, { cwd: process.cwd(), maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        console.error("Script error:", stderr || err.message)
        resolve(NextResponse.json({ error: stderr || err.message }, { status: 500 }))
      } else {
        // stdout should be the base64 image string
        const base64 = stdout.trim()
        if (!base64) {
          resolve(NextResponse.json({ error: "No image data returned from script." }, { status: 500 }))
        } else {
          resolve(NextResponse.json({ image: base64 }))
        }
      }
    })
  })
} 