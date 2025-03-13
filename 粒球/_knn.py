from sklearn.metrics import accuracy_score
from sklearn.neighbors import KNeighborsClassifier
import numpy as np

def KNNN(X_train, X_test,y_train, y_test):
    """
    KNN function to evaluate the average accuracy for K = 1, 3, 5.

    Args:
    - X_train (numpy.ndarray): Training features.
    - y_train (numpy.ndarray): Training labels.
    - X_test (numpy.ndarray): Testing features.
    - y_test (numpy.ndarray): Testing labels.

    Returns:
    - avg_accuracy (float): The average accuracy for K = 1, 3, 5.
    """
    accuracies = []

    # Loop through K values 1, 3, 5
    for k in [1, 3, 5]:
        # Initialize the KNN classifier with the current value of K
        knn = KNeighborsClassifier(n_neighbors=k)

        # Train the classifier on the training data
        knn.fit(X_train, y_train)

        # Predict the labels for the test set
        y_pred = knn.predict(X_test)

        # Calculate the accuracy and append to the list
        accuracy = accuracy_score(y_test, y_pred)
        accuracies.append(accuracy)

    # Calculate the average accuracy
    avg_accuracy = np.mean(accuracies)
    return avg_accuracy
