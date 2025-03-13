from math import exp
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics.pairwise import euclidean_distances
import math

mm = MinMaxScaler(copy=False)

def c_euclidean(a, b, s):
    v = 0
    for c in range(s):
        v += (a[c] - b[c]) ** 2
    return math.sqrt(v)

def euclidean(a, b):
    return c_euclidean(a, b, len(a))

def sr(dataset, targets, n_jobs=1):
    scores = np.zeros((targets.size, 1), dtype=np.float64)
    radius = np.zeros_like(scores)
    # Calculate score
    for i, (instance, target) in enumerate(zip(dataset, targets)):
        denom = 0
        num = 0
        radius[i] = np.inf
        for another_instance, another_target in zip(dataset, targets):
            dist = euclidean(instance, another_instance)
            val = exp(-dist)
            denom += val
            if target == another_target:
                num += val
            else:
                num -= val
                if dist < radius[i]:
                    radius[i] = dist
        num -= 1
        denom -= 1
        scores[i] = num / denom
    return scores, radius

def relevants(idx, scores, radius, threshold, dataset, targets):
    selected_set = []
    selected_radius = []
    for id in idx:
        score = scores[id]
        if score < threshold:
            break
        instance = dataset[id, :]
        target = targets[id]
        for s_id in selected_set:
            another_target = targets[s_id]
            if another_target == target:
                dist = euclidean(instance, dataset[s_id, :])
                if dist < radius[s_id]:
                    break
        else:
            selected_set.append(id)
            selected_radius.append(radius[id])
    return selected_set, selected_radius

def _norm_by_clas(scores, targets):
    # Normalize by class
    classes = np.unique(targets)
    for class_ in classes:
        mm_class_ = MinMaxScaler()
        mask = (targets == class_)
        scores[mask] = mm_class_.fit_transform(scores[mask])

def classify(X_test, X_selection, radius):
    # Sum const to avoid division by zero
    radius_temp = radius + 1e-8

    # Compute distance between Test and Selection instances
    dists = euclidean_distances(X_test, X_selection)
    dists = dists / radius_temp

    # Get index of train samples to get class label
    index = np.argmin(dists, axis=1)

    return index

def RIS2(dataset, targets, threshold, n_jobs=1):
    scores, radius = sr(dataset, targets, n_jobs)
    _norm_by_clas(scores, targets)
    # Fixed decimals issues
    scores = np.round(scores, decimals=5)
    idx = scores.argsort(None)[::-1]
    idx = idx.astype(int)
    # Return the relevants
    _rels, radius = relevants(idx, scores, radius, threshold, dataset, targets)
    return dataset[_rels], targets[_rels], np.array(radius).flatten()
