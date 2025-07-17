import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import io
import base64
from utils import load_data, sort_samples, filter_samples
from datetime import datetime
import matplotlib as mpl

def create_histogram(
    data,
    value_col_pattern="Positive|H[-_]?Score|Positive_Cell_Percentage",
    sample_col_name="Sample",
    title="Histogram of Positive Cell Percentage",
    font_style="sans-serif",
    color="skyblue",
    letter_groups=None,  # e.g., ["B", "C"]
    exclude_ids=None,
    output_format="png"
):
    # Identify relevant columns
    col_names = data.columns.tolist()
    matches = [col for col in col_names if pd.Series(col).str.contains(value_col_pattern, case=False, regex=True).any()]
    if len(matches) != 1:
        raise ValueError(f"Expected exactly one matching column for value_col_pattern '{value_col_pattern}', found: {matches}")
    value_col = matches[0]
    sample_col = sample_col_name if sample_col_name in col_names else col_names[0]

    # Filter samples by exclude_ids
    data = filter_samples(data, exclude_ids, sample_col)

    # Filter by letter groups if specified
    if letter_groups:
        mask = data[sample_col].astype(str).apply(lambda x: any(lg in x for lg in letter_groups))
        data = data[mask]

    # Drop NaN values in value_col
    values = data[value_col].dropna().astype(float)
    if values.empty:
        raise ValueError("No data points available for histogram after filtering.")

    # Bin calculation: min rounded down to nearest 10, max rounded up to nearest 10, bin size 10
    min_val = np.floor(values.min() / 10) * 10
    max_val = np.ceil(values.max() / 10) * 10
    bins = np.arange(min_val, max_val + 10, 10)

    # Plot
    plt.figure(figsize=(8, 6))
    plt.rcParams['font.family'] = font_style
    plt.hist(values, bins=bins, color=color, edgecolor='black')
    plt.title(title)
    plt.xlabel(value_col)
    plt.ylabel("Number of Samples")
    plt.xticks(bins)
    plt.tight_layout()

    # Output to bytes
    img_bytes = io.BytesIO()
    plt.savefig(img_bytes, format=output_format, bbox_inches='tight')
    plt.close()
    img_bytes.seek(0)
    return img_bytes.getvalue()


def main(
    file_path,
    title=None,
    font_style="sans-serif",
    color_map=None,
    letter_groups=None,
    exclude_ids=None,
    output_format="png"
):
    # Dynamic title logic for histogram
    if title is None:
        if not letter_groups:
            title = "Histogram of PTK7 Membrane Positive Cell Percentage - All Data"
        else:
            title = "Histogram of PTK7 Membrane Positive Cell Percentage - Columns"
    # Determine color from color_map
    if color_map == "skyblue":
        color = "skyblue"
    elif color_map:
        cmap = mpl.colormaps.get_cmap(color_map)
        color = cmap(0.5) if hasattr(cmap, '__call__') else color_map
    else:
        color = "skyblue"
    data = load_data(file_path)
    img_bytes = create_histogram(
        data,
        title=title,
        font_style=font_style,
        color=color,
        letter_groups=letter_groups,
        exclude_ids=exclude_ids,
        output_format=output_format
    )
    # Print base64 to stdout for API
    print(base64.b64encode(img_bytes).decode())

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--file_path", type=str, default="data/sampleData.csv")
    parser.add_argument("--title", type=str, default=None)
    parser.add_argument("--font_style", type=str, default="sans-serif")
    parser.add_argument("--color_map", type=str, default=None)
    parser.add_argument("--letter_groups", type=str, default=None)
    args = parser.parse_args()
    letter_groups = [s.strip() for s in args.letter_groups.split(",") if s.strip()] if args.letter_groups else None
    main(
        file_path=args.file_path,
        title=args.title,
        font_style=args.font_style,
        color_map=args.color_map,
        letter_groups=letter_groups,
    ) 