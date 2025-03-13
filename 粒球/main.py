from ACCGBKNN import ACCGBKNN
from AMGBKNN import AMGBKNN
from ORIGBKNN import ORIGBKNN
from KMKNN import KMKNN
from _knn import KNNN
from IGBKNN import IGBKNN
from DCHIG_C import KMGBKNN
import pandas as pd
from sklearn.model_selection import StratifiedKFold
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import warnings
from sklearn.exceptions import ConvergenceWarning
from tqdm import tqdm  # Import tqdm for progress bar

warnings.filterwarnings("ignore", category=RuntimeWarning, module="sklearn.cluster._kmeans")
warnings.filterwarnings("ignore", category=ConvergenceWarning)

def add_label_noise(y, noise_level):
    y = np.asarray(y, dtype=int)
    unique_classes = np.unique(y)
    noisy_indices = np.random.choice(len(y), int(noise_level * len(y)), replace=False)
    y_noisy = y.copy()
    for idx in noisy_indices:
        current_label = y[idx]
        possible_labels = unique_classes[unique_classes != current_label]
        new_label = np.random.choice(possible_labels)
        y_noisy[idx] = new_label
    return y_noisy

datasets = ['austra.csv', 'Diabetes.csv', 'German.csv', 'Wave.csv', 'optdigits.csv',
            'texture.csv', 'wdbc.csv', 'fourclass.csv', 'pen.csv', 'splice.csv', 'svmguide1.csv', 'image-seg.csv',
            'Letter.csv']

# Open file to save results
with open("results0.txt", "w") as file:
    # Wrap datasets iteration with tqdm for progress
    for data_nm in tqdm(datasets, desc="Processing Datasets"):
        print(f"当前数据集是{data_nm}")
        filepath = fr'C:\Users\20583\Desktop\data\{data_nm}'
        data_frame = pd.read_csv(filepath, header=None)

        data = data_frame.values
        features = data[:, :-1]
        labels = data[:, -1]

        # 10-fold cross-validation with progress bar
        skf = StratifiedKFold(10, shuffle=True, random_state=42)
        for train_index, test_index in tqdm(skf.split(features, labels), desc=f"Cross-validation on {data_nm}", total=10):
            X_train, X_test = features[train_index], features[test_index]
            y_train, y_test = labels[train_index], labels[test_index]

            # Add label noise if needed
            y_train = add_label_noise(y_train, noise_level=0)

            scaler = MinMaxScaler()
            X_train = scaler.fit_transform(X_train)
            X_test = scaler.transform(X_test)

            # Write results for each algorithm
            file.write(f"Results for {data_nm}:\n")
            file.write(f"KMGBKNN: {KMGBKNN(X_train, X_test, y_train, y_test)}\n")
            file.write(f"KMKNN: {KMKNN(X_train, X_test, y_train, y_test)}\n")
            file.write(f"IGBKNN: {IGBKNN(X_train, X_test, y_train, y_test)}\n")
            file.write(f"ORIGBKNN: {ORIGBKNN(X_train, X_test, y_train, y_test)}\n")
            file.write(f"ACCGBKNN: {ACCGBKNN(X_train, X_test, y_train, y_test)}\n")
            file.write(f"AMGBKNN: {AMGBKNN(X_train, X_test, y_train, y_test)}\n")
            file.write(f"KNNN: {KNNN(X_train, X_test, y_train, y_test)}\n")
            file.write("\n")  # Add newline to separate datasets
