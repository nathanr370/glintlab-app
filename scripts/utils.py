import pandas as pd
import numpy as np

# Function to load and process the data
def load_data(file_path):
    data = pd.read_csv(file_path)
    data.columns = data.columns.str.replace(r'[. ]+', '_', regex=True)
    return data

# Function to sort samples based on numeric and letter parts
def sort_samples(sample_column):
    return sorted(sample_column, key=lambda x: (int(''.join(filter(str.isdigit, x))), ''.join(filter(str.isalpha, x))))

# Function to filter samples
def filter_samples(data, exclude_ids, sample_col):
    if not exclude_ids:
        return data
    exclude_ids_set = set(exclude_ids)
    def should_exclude(sample):
        for ex in exclude_ids_set:
            if len(ex) == 1:
                if ex in sample:
                    return True
            else:
                if sample == ex:
                    return True
        return False
    mask = data[sample_col].apply(should_exclude)
    data.loc[mask, :] = np.nan
    return data 