"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HamburgerMenu } from "@/components/hamburger-menu"

const FONT_OPTIONS = [
  { label: "Sans-serif (default)", value: "sans-serif" },
  { label: "Serif", value: "serif" },
]
const COLOR_OPTIONS = [
  { label: "Yellow and Red", value: "YlOrRd" },
  { label: "July 4", value: "coolwarm" },
  { label: "Viridis", value: "viridis" },
]

const BOXPLOT_COLOR_OPTIONS = [
  { label: "Set 1", value: "Set1" },
  { label: "Set 2", value: "Set2" },
  { label: "Tab 10", value: "tab10" },
];

const HISTOGRAM_COLOR_OPTIONS = [
  { label: "CoolWarm", value: "coolwarm" },
  { label: "Inferno", value: "inferno" },
  { label: "Sky Blue", value: "skyblue" },
  { label: "Magma", value: "magma" },
];

export default function ResultsPage() {
  const [selectedVisualization, setSelectedVisualization] = useState<string | null>(null);
  const [checkingVis, setCheckingVis] = useState(true);
  const [img, setImg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Heatmap parameter state
  const [title, setTitle] = useState("Heatmap of Positive Cell Percentage")
  const [font, setFont] = useState("sans-serif")
  const [color, setColor] = useState("YlOrRd")
  const [excludeRows, setExcludeRows] = useState<string[]>([])
  const [excludeCols, setExcludeCols] = useState<string[]>([])
  const [showStats, setShowStats] = useState(true)

  // Boxplot parameter state
  const [boxTitle, setBoxTitle] = useState("Box Plot of % Positive Area by Group");
  const [boxFont, setBoxFont] = useState("sans-serif");
  const [boxColor, setBoxColor] = useState("Set2");
  // Remove yCol and boxplotColumns state for boxplot
  // Remove Y-axis dropdown from the parameter panel
  // Always use 'Positive_Area_Percentage' as y_col for boxplot visualizations

  // Histogram parameter state
  const [histTitle, setHistTitle] = useState("Histogram of PTK7 Membrane Positive Cell Percentage - All Data");
  const [histFont, setHistFont] = useState("sans-serif");
  const [histColor, setHistColor] = useState("viridis");
  const [histLetterGroups, setHistLetterGroups] = useState<string[]>([]);
  const [availableLetterGroups, setAvailableLetterGroups] = useState<string[]>([]);

  // These must be at the top!
  const [rowLetters, setRowLetters] = useState<string[]>([]);
  const [colNumbers, setColNumbers] = useState<string[]>([]);

  // Helper to combine exclude rows/cols for backend
  const getExcludeIds = () => [...excludeRows, ...excludeCols]

  // Fetch visualization (heatmap or boxplot) with current parameters
  const fetchVisualization = async () => {
    setLoading(true)
    setError(null)
    setImg(null)
    const type = localStorage.getItem("selectedVisualization") || "heatmap"
    let params: any = {}
    if (type === "heatmap") {
      params = {
        title,
        font_style: font,
        color_map: color,
        exclude_ids: getExcludeIds(),
        show_stats: showStats,
      }
    } else if (type === "box_and_scatter" || type === "box_whisker") {
      params = {
        title: boxTitle,
        font_style: boxFont,
        color_palette: boxColor,
        y_col: 'Positive_Area_Percentage',
      }
    } else if (type === "histogram") {
      params = {
        title: histTitle,
        font_style: histFont,
        color_map: histColor,
        letter_groups: histLetterGroups,
      }
    }
    try {
      const res = await fetch("/api/run-visualization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ...params }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      if (data.image) setImg(data.image)
      else if (data.error) setError(data.error)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch and update on parameter change
  useEffect(() => {
    if (selectedVisualization === "heatmap") {
      fetchVisualization()
    } else if (selectedVisualization === "box_and_scatter" || selectedVisualization === "box_whisker") {
      fetchVisualization()
    } else if (selectedVisualization === "histogram") {
      fetchVisualization();
    }
    // eslint-disable-next-line
  }, [
    title,
    font,
    color,
    excludeRows.join(","),
    excludeCols.join(","),
    showStats,
    boxTitle,
    boxFont,
    boxColor,
    histTitle,
    histFont,
    histColor,
    histLetterGroups,
    // yCol
  ])

  // Fetch available row letters and col numbers from backend
  useEffect(() => {
    if (selectedVisualization === "heatmap") {
      fetch("/api/run-visualization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "heatmap", optionsOnly: true }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.rowLetters) setRowLetters(data.rowLetters);
          if (data.colNumbers) setColNumbers(data.colNumbers);
        });
    } else if (selectedVisualization === "box_and_scatter" || selectedVisualization === "box_whisker") {
      // Remove Y-axis dropdown from the parameter panel
      // Always use 'Positive_Area_Percentage' as y_col for boxplot visualizations
    }
  }, [selectedVisualization]);

  // Fetch available letter groups for histogram
  useEffect(() => {
    if (selectedVisualization === "histogram") {
      fetch("/api/run-visualization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "histogram", optionsOnly: true }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.letterGroups) setAvailableLetterGroups(data.letterGroups);
        });
    }
  }, [selectedVisualization]);

  // Update histogram title based on letter groups
  useEffect(() => {
    if (selectedVisualization === "histogram") {
      if (histLetterGroups.length === 0) {
        setHistTitle("Histogram of PTK7 Membrane Positive Cell Percentage - All Data");
      } else {
        setHistTitle("Histogram of PTK7 Membrane Positive Cell Percentage - Columns");
      }
    }
    // eslint-disable-next-line
  }, [histLetterGroups, selectedVisualization]);

  // Auto-fetch visualization when yCol is set for boxplot, or on parameter change for heatmap
  useEffect(() => {
    if ((selectedVisualization === "box_and_scatter" || selectedVisualization === "box_whisker") && 'Positive_Area_Percentage') {
      fetchVisualization();
    } else if (selectedVisualization === "heatmap") {
      fetchVisualization();
    } else if (selectedVisualization === "histogram") {
      fetchVisualization();
    }
    // eslint-disable-next-line
  }, [selectedVisualization, 'Positive_Area_Percentage', title, font, color, excludeRows, excludeCols, showStats, histTitle, histFont, histColor, histLetterGroups]);

  // Clear state when switching visualization types
  useEffect(() => {
    if (selectedVisualization === "box_and_scatter" || selectedVisualization === "box_whisker") {
      setRowLetters([]);
      setColNumbers([]);
    }
    if (selectedVisualization === "heatmap") {
      // setBoxplotColumns([]); // Removed as per edit hint
      // setYCol(""); // Removed as per edit hint
    }
    if (selectedVisualization === "histogram") {
      setHistLetterGroups([]);
    }
  }, [selectedVisualization]);

  // Redirect to visualization type selection if not set
  useEffect(() => {
    const vis = localStorage.getItem("selectedVisualization");
    if (!vis) {
      router.replace("/visualization-type");
    } else {
      setSelectedVisualization(vis);
    }
    setCheckingVis(false);
  }, [router]);

  if (checkingVis) {
    return null; // or a loading spinner
  }

  // Handlers for parameter changes (no fetchVisualization calls)
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }
  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFont(e.target.value)
  }
  const handleColorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setColor(e.target.value)
  }
  const handleRowToggle = (row: string) => {
    setExcludeRows(prev => prev.includes(row) ? prev.filter(r => r !== row) : [...prev, row])
  }
  const handleColToggle = (col: string) => {
    setExcludeCols(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col])
  }
  const handleShowStats = (val: boolean) => {
    setShowStats(val)
  }

  const handleDone = async () => {
    await fetch("/api/cleanup", { method: "POST" })
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-row items-start justify-between p-4">
      <HamburgerMenu />
      {/* Fixed logo at top center */}
      <div className="fixed left-1/2 transform -translate-x-1/2 z-50 w-[250px] flex justify-center" style={{ top: '48px', pointerEvents: 'none' }}>
        <Image src="/glintlab-logo.png" alt="GlintLab Logo" width={250} height={80} />
      </div>
      {/* Main content (70%) on the left */}
      <div className="w-full md:w-[70%] max-w-2xl flex flex-col items-center justify-center mx-auto" style={{ minHeight: '80vh' }}>
        <div style={{ height: '120px' }} />
        <Card className="w-full flex flex-col items-center justify-center mt-8 p-8 md:p-12 max-w-3xl">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">Visualization Output</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {loading ? (
              <div className="text-slate-500">Generating visualization...</div>
            ) : img ? (
              <>
                <img src={`data:image/png;base64,${img}`} alt="Visualization Output" className="max-w-[600px] max-h-[600px] rounded shadow mx-auto" />
                <a
                  href={`data:image/png;base64,${img}`}
                  download="visualization.png"
                  className="mt-4"
                >
                  <Button className="bg-teal-500 hover:bg-teal-600 w-full">Download Image</Button>
                </a>
                <div className="text-red-600 text-sm mt-2 text-center font-semibold">
                  NOTE: Your data and visualization will be deleted if you leave this page, or click 'Done'
                </div>
              </>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : null}
          </CardContent>
        </Card>
        <Button onClick={handleDone} className="w-full bg-teal-600 hover:bg-teal-700 mt-4">Done</Button>
      </div>
      {/* Right parameter UI (30%) - show for heatmap, boxplot, or histogram */}
      {(selectedVisualization === "heatmap" || selectedVisualization === "box_and_scatter" || selectedVisualization === "box_whisker" || selectedVisualization === "histogram") && (
        <div className="hidden md:flex flex-col w-[30%] max-w-md mx-auto" style={{ alignItems: 'center' }}>
          <div className="flex flex-col justify-center self-start" style={{ marginTop: '160px', width: '100%' }}>
            <div className="bg-white/80 rounded-lg shadow-lg p-8 space-y-6">
              {selectedVisualization === "heatmap" && (
                <h2 className="text-xl font-bold mb-2">Heatmap Parameters</h2>
              )}
              {(selectedVisualization === "box_and_scatter" || selectedVisualization === "box_whisker") && (
                <h2 className="text-xl font-bold mb-2">Boxplot Parameters</h2>
              )}
              {selectedVisualization === "histogram" && (
                <h2 className="text-xl font-bold mb-2">Histogram Parameters</h2>
              )}
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold mb-1">Title</label>
                <input
                  type="text"
                  value={selectedVisualization === "heatmap" ? title : selectedVisualization === "box_and_scatter" || selectedVisualization === "box_whisker" ? boxTitle : histTitle}
                  onChange={selectedVisualization === "heatmap" ? handleTitleChange : selectedVisualization === "box_and_scatter" || selectedVisualization === "box_whisker" ? (e) => setBoxTitle(e.target.value) : (e) => setHistTitle(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-base"
                />
              </div>
              {/* Font */}
              <div>
                <label className="block text-sm font-semibold mb-1">Font</label>
                <select
                  value={selectedVisualization === "heatmap" ? font : selectedVisualization === "box_and_scatter" || selectedVisualization === "box_whisker" ? boxFont : histFont}
                  onChange={selectedVisualization === "heatmap" ? handleFontChange : selectedVisualization === "box_and_scatter" || selectedVisualization === "box_whisker" ? (e) => setBoxFont(e.target.value) : (e) => setHistFont(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-base"
                >
                  {FONT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {/* Color */}
              <div>
                <label className="block text-sm font-semibold mb-1">Color</label>
                <select
                  value={selectedVisualization === "heatmap" ? color : selectedVisualization === "box_and_scatter" || selectedVisualization === "box_whisker" ? boxColor : histColor}
                  onChange={selectedVisualization === "heatmap" ? handleColorChange : selectedVisualization === "box_and_scatter" || selectedVisualization === "box_whisker" ? (e) => setBoxColor(e.target.value) : (e) => setHistColor(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-base"
                >
                  {(selectedVisualization === "heatmap" ? COLOR_OPTIONS : selectedVisualization === "box_and_scatter" || selectedVisualization === "box_whisker" ? BOXPLOT_COLOR_OPTIONS : HISTOGRAM_COLOR_OPTIONS).map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {/* Histogram: Include only letter groups */}
              {selectedVisualization === "histogram" && (
                <div>
                  <div className="text-red-600 font-semibold mb-1">Currently Debugging</div>
                  <label className="block text-sm font-semibold mb-1">Include only (letter groups)</label>
                  <div className="flex flex-wrap gap-2">
                    {availableLetterGroups.map((group: string) => (
                      <button
                        key={group}
                        className={`px-3 py-1 rounded border ${histLetterGroups.includes(group) ? 'bg-teal-500 text-white' : 'bg-white text-slate-700 border-slate-300'}`}
                        onClick={e => {
                          e.preventDefault();
                          setHistLetterGroups(prev => prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]);
                        }}
                      >
                        {group}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Exclude/Show Stats for heatmap only */}
              {selectedVisualization === "heatmap" && (
                <>
                  {/* Exclude Rows */}
                  <div>
                    <label className="block text-sm font-semibold mb-1">Exclude Rows (letters)</label>
                    <div className="flex flex-wrap gap-2">
                      {rowLetters.map((row: string) => (
                        <button
                          key={row}
                          className={`px-3 py-1 rounded border ${excludeRows.includes(row) ? 'bg-teal-500 text-white' : 'bg-white text-slate-700 border-slate-300'}`}
                          onClick={e => { e.preventDefault(); handleRowToggle(row) }}
                        >
                          {row}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Exclude Cols */}
                  <div>
                    <label className="block text-sm font-semibold mb-1">Exclude Cols (numbers)</label>
                    <div className="flex flex-wrap gap-2">
                      {colNumbers.map((col: string) => (
                        <button
                          key={col}
                          className={`px-3 py-1 rounded border ${excludeCols.includes(col) ? 'bg-teal-500 text-white' : 'bg-white text-slate-700 border-slate-300'}`}
                          onClick={e => { e.preventDefault(); handleColToggle(col) }}
                        >
                          {col}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Show Stats */}
                  <div>
                    <label className="block text-sm font-semibold mb-1">Show Stats</label>
                    <div className="flex gap-4 mt-1">
                      <button
                        className={`px-4 py-1 rounded border ${showStats ? 'bg-teal-500 text-white' : 'bg-white text-slate-700 border-slate-300'}`}
                        onClick={e => { e.preventDefault(); handleShowStats(true) }}
                      >
                        Yes
                      </button>
                      <button
                        className={`px-4 py-1 rounded border ${!showStats ? 'bg-teal-500 text-white' : 'bg-white text-slate-700 border-slate-300'}`}
                        onClick={e => { e.preventDefault(); handleShowStats(false) }}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
