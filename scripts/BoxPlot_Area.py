import os
import glob
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from datetime import datetime
from utils import load_data
import io
import base64
import sys
import numpy as np

# Removed local load_data function

def create_boxplot(data, group_by, y_col, y_label, plot_title=None, custom_palette=None, sample_order=None, custom_font=None, export_format='png', show_scatter=True):
    """
    Generate a boxplot for the specified y_col grouped by group_by and return as bytes.
    sample_order: list of sample names (strings) to specify custom order and filter samples.
    custom_palette: list or seaborn palette name for coloring the groups.
    custom_font: string, font family name to use for all text in the plot.
    export_format: 'png' or 'pdf' for output file format.
    show_scatter: boolean, whether to overlay individual data points as scatter plot.
    """
    print(f"[DEBUG] create_boxplot called with group_by={group_by}, y_col={y_col}, y_label={y_label}, sample_order={sample_order}, custom_font={custom_font}, show_scatter={show_scatter}", file=sys.stderr)
    print(f"[DEBUG] Data columns: {list(data.columns)}", file=sys.stderr)
    print(f"[DEBUG] Unique values in group_by column '{group_by}': {data[group_by].unique()}", file=sys.stderr)
    print(f"[DEBUG] Data head before filtering:\n{data.head()}", file=sys.stderr)

    if group_by not in data.columns:
        raise ValueError(f"The specified group_by column '{group_by}' is not in the dataset.")
    if y_col not in data.columns:
        raise ValueError(f"The specified y_col '{y_col}' is not in the dataset.")

    # Set custom font if provided
    if custom_font is not None:
        plt.rcParams["font.family"] = custom_font

    # Filter and order samples if sample_order is provided
    if sample_order is not None:
        data = data[data[group_by].isin(sample_order)].copy()
        data[group_by] = pd.Categorical(data[group_by], categories=sample_order, ordered=True)
        order = sample_order
        print(f"[DEBUG] Data head after filtering by sample_order:\n{data.head()}", file=sys.stderr)
        print(f"[DEBUG] Unique values in group_by after filtering: {data[group_by].unique()}", file=sys.stderr)
    else:
        order = data[group_by].unique()

    # Set up the color palette
    if custom_palette is None:
        # Use a default palette with as many colors as there are groups
        palette = sns.color_palette("Set1", n_colors=len(order))
    elif isinstance(custom_palette, str):
        palette = sns.color_palette(custom_palette, n_colors=len(order))
    else:
        palette = custom_palette

    plt.figure(figsize=(10, 6))
    ax = sns.boxplot(
        x=group_by,
        y=y_col,
        hue=group_by,
        data=data,
        order=order,
        palette=palette,
        legend=False
    )
    # Overlay stripplot for individual data points as big black dots
    if show_scatter:
        np.random.seed(42)  # Fix jitter randomness
        sns.stripplot(
            x=group_by,
            y=y_col,
            data=data,
            order=order,
            color='black',
            dodge=False,
            jitter=True,
            size=6.5,  
            alpha=0.7,
            legend=False,
            ax=ax
        )
    ax.set_xlabel(group_by)
    ax.set_ylabel(y_label)
    if plot_title:
        ax.set_title(plot_title)
    plt.tight_layout()
    # Output to bytes
    img_bytes = io.BytesIO()
    plt.savefig(img_bytes, format=export_format)
    plt.close()
    img_bytes.seek(0)
    return img_bytes.getvalue()

    # Remove the redundant legend if it appears
    if ax.get_legend() is not None:
        ax.get_legend().remove()

def main(dataType="Area", group_by="Sample", custom_order_str=None, custom_palette=None, custom_font=None, export_format='png', show_scatter=True):
    print(f"[DEBUG] main called with dataType={dataType}, group_by={group_by}, custom_order_str={custom_order_str}, custom_font={custom_font}, show_scatter={show_scatter}", file=sys.stderr)
    # Find the first CSV file in the data folder
    data_folder = "data"
    csv_files = glob.glob(os.path.join(data_folder, "*.csv"))
    if not csv_files:
        raise FileNotFoundError("No CSV files found in the 'data' folder.")
    file_path = csv_files[0]
    print(f"[DEBUG] Using CSV file: {file_path}", file=sys.stderr)
    data = load_data(file_path)
    print(f"[DEBUG] Data loaded. Columns: {list(data.columns)}. Shape: {data.shape}", file=sys.stderr)

    # Parse custom order string if provided
    sample_order = None
    if custom_order_str:
        sample_order = [s.strip() for s in custom_order_str.split(",") if s.strip()]
        print(f"[DEBUG] Parsed sample_order: {sample_order}", file=sys.stderr)

    # Ensure group_by column is string for matching
    data[group_by] = data[group_by].astype(str)

    # Determine y_col and y_label based on dataType
    if dataType == "Area":
        y_col = "Positive_Area_Percentage"
        y_label = "% Positive Area"
    elif dataType == "Cell":
        y_col = "Positive_Cell_Percentage"
        y_label = "% Positive Cells"
    else:
        raise ValueError("dataType must be either 'Area' or 'Cell'")

    if y_col not in data.columns:
        raise ValueError(f"Column '{y_col}' not found in the data. Available columns: {list(data.columns)}")

    # Output file naming (not used, just for reference)
    if show_scatter:
        vis_type = "Box_and_Scatter"
    else:
        vis_type = "BoxPlot"

    img_bytes = create_boxplot(
        data,
        group_by=group_by,
        y_col=y_col,
        y_label=y_label,
        plot_title=f"Box Plot of {y_label} by {group_by}",
        custom_palette=custom_palette,
        sample_order=sample_order,
        custom_font=custom_font,
        export_format=export_format,
        show_scatter=show_scatter
    )
    # Print base64 to stdout for API
    print(base64.b64encode(img_bytes).decode())


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--show_scatter", type=str, default="True")
    parser.add_argument("--group_by", type=str, default="Sample")
    parser.add_argument("--dataType", type=str, default="Area")
    parser.add_argument("--title", type=str, default=None)
    parser.add_argument("--font_style", type=str, default=None)
    parser.add_argument("--color_palette", type=str, default=None)
    parser.add_argument("--y_col", type=str, default=None)
    args = parser.parse_args()
    show_scatter = args.show_scatter.lower() == "true"

    # Determine y_col and y_label
    y_col = args.y_col
    y_label = None
    if y_col is None:
        if args.dataType == "Area":
            y_col = "Positive_Area_Percentage"
            y_label = "% Positive Area"
        elif args.dataType == "Cell":
            y_col = "Positive_Cell_Percentage"
            y_label = "% Positive Cells"
        else:
            raise ValueError("dataType must be either 'Area' or 'Cell'")
    else:
        y_label = y_col

    # Use title if provided, else default
    plot_title = args.title if args.title else f"Box Plot of {y_label} by {args.group_by}"

    # Call main with all parameters
    def main_cli():
        data_folder = "data"
        csv_files = glob.glob(os.path.join(data_folder, "*.csv"))
        if not csv_files:
            raise FileNotFoundError("No CSV files found in the 'data' folder.")
        file_path = csv_files[0]
        data = load_data(file_path)
        data[args.group_by] = data[args.group_by].astype(str)
        img_bytes = create_boxplot(
            data,
            group_by=args.group_by,
            y_col=y_col,
            y_label=y_label,
            plot_title=plot_title,
            custom_palette=args.color_palette,
            sample_order=None,
            custom_font=args.font_style,
            export_format='png',
            show_scatter=show_scatter
        )
        print(base64.b64encode(img_bytes).decode())

    main_cli()

