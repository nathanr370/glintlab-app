# Import necessary libraries
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np
import io
import datetime
import base64
from utils import load_data, sort_samples, filter_samples
import matplotlib.font_manager

# Heatmap generation function with enhanced features
def create_heatmap(
    data, 
    total_pattern="Positive|H[-_]?Score", 
    title="Heatmap", 
    font_style="sans-serif", 
    color_map="YlOrRd",
    exclude_ids=None,
    rowOrder=None,
    colOrder=None,
    show_stats=True,
    output_format="png",
    legend_shrink=1.0
):
    
    # Identify relevant columns
    col_names = data.columns.tolist()
    matches = [col for col in col_names if pd.Series(col).str.contains(total_pattern, case=False, regex=True).any()]
    
    if len(matches) != 1:
        raise ValueError(f"Expected exactly one matching column for total_pattern '{total_pattern}', found: {matches}")
    
    value_col = matches[0]
    sample_col = col_names[0]

    # Filter and sort data
    data = filter_samples(data, exclude_ids, sample_col)
    sorted_samples = sort_samples(data[sample_col].dropna())
    data_sorted = data.set_index(sample_col).loc[sorted_samples].reset_index()

    # Organize heatmap layout
    col_dict, row_dict = {}, {}
    for _, row in data_sorted.iterrows():
        sample, val = row[sample_col], row[value_col]
        row_letter = ''.join(filter(str.isalpha, sample))
        col_number = ''.join(filter(str.isdigit, sample))
        col_dict.setdefault(col_number, []).append((sample, val))
        row_dict.setdefault(row_letter, []).append((sample, val))

    col_keys = [str(c) for c in colOrder if str(c) in col_dict] if colOrder else sorted(col_dict.keys())
    row_keys = [str(r) for r in rowOrder if str(r) in row_dict] if rowOrder else sorted(row_dict.keys())

    reshaped_values = np.full((len(row_keys), len(col_keys)), np.nan)
    sample_labels = np.full((len(row_keys), len(col_keys)), '', dtype=object)

    for col_idx, col_num in enumerate(col_keys):
        samples = dict(col_dict.get(col_num, []))
        for row_idx, row_letter in enumerate(row_keys):
            for s_name, s_val in samples.items():
                if row_letter in s_name and col_num in s_name:
                    reshaped_values[row_idx, col_idx] = s_val
                    label = f"{s_name}: {s_val:.2f}%" if show_stats and not np.isnan(s_val) else s_name
                    sample_labels[row_idx, col_idx] = label

    # Map frontend font_style to installed font names
    font_map = {
        "Arial": "Arial",
        "Times New Roman": "Times New Roman",
        "Liberation Sans": "Liberation Sans",
        "DejaVu Sans": "DejaVu Sans",
        "sans-serif": "DejaVu Sans",
        "serif": "DejaVu Serif"
    }
    selected_font = font_map.get(font_style, "DejaVu Sans")
    plt.rcParams['font.family'] = [selected_font, 'sans-serif']

    # Plot heatmap
    plt.figure(figsize=(10, 6))
    ax = sns.heatmap(
        reshaped_values,
        cmap=color_map,
        annot=sample_labels,
        cbar=True,
        annot_kws={'size': 7},
        cbar_kws={'label': value_col, 'shrink': legend_shrink},
        xticklabels=col_keys,
        yticklabels=row_keys,
        fmt=""
    )

    ax.set_xlabel('')
    ax.set_ylabel('')
    ax.set_title(title)
    ax.collections[0].colorbar.set_label(value_col)

    # Output to bytes
    img_bytes = io.BytesIO()
    plt.savefig(img_bytes, format=output_format, bbox_inches='tight')
    plt.close()
    img_bytes.seek(0)
    return img_bytes.getvalue()

# Main callable function
def main(
    file_path,
    title="Heatmap of Positive Cell Percentage",
    font_style="sans-serif",
    color_map="YlOrRd",
    exclude_ids=None,
    rowOrder=None,
    colOrder=None,
    show_stats=True,
    output_format="png",
    legend_shrink=1.0
):
    data = load_data(file_path)
    img_bytes = create_heatmap(
        data,
        title=title,
        font_style=font_style,
        color_map=color_map,
        exclude_ids=exclude_ids,
        rowOrder=rowOrder,
        colOrder=colOrder,
        show_stats=show_stats,
        output_format=output_format,
        legend_shrink=legend_shrink
    )
    # Print base64 to stdout for API
    print(base64.b64encode(img_bytes).decode())
    
if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--file_path", type=str, default="data/sampleData.csv")
    parser.add_argument("--title", type=str, default="Heatmap of Positive Cell Percentage")
    parser.add_argument("--font_style", type=str, default="sans-serif")
    parser.add_argument("--color_map", type=str, default="YlOrRd")
    parser.add_argument("--exclude_ids", type=str, default=None)
    parser.add_argument("--show_stats", type=str, default="True")
    args = parser.parse_args()
    exclude_ids = args.exclude_ids.split(",") if args.exclude_ids else None
    show_stats = args.show_stats.lower() == "true"
    main(
        file_path=args.file_path,
        title=args.title,
        font_style=args.font_style,
        color_map=args.color_map,
        exclude_ids=exclude_ids,
        show_stats=show_stats
    )
    