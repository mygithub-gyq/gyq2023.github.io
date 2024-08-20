import math
import numpy as np

from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics.pairwise import euclidean_distances

mm = MinMaxScaler(copy=False)


def _scores_radius(dataset, targets, n_jobs=1):
    scores = np.zeros((targets.size, 1), dtype=np.float_)
    radius = np.zeros_like(scores)
    n, m = dataset.shape
    for i in range(n):
        num = 0
        denom = 0
        instance = dataset[i, :]
        target = targets[i]
        radius[i, 0] = math.inf
        for j in range(n):
            another_instance = dataset[j, :]
            another_target = targets[j]
            dist = c_euclidean(instance, another_instance, m)
            val = math.exp(-dist)
            denom = denom + val
            if target == another_target:
                num = num + val
            else:
                num = num - val
                if dist < radius[i, 0]:
                    radius[i, 0] = dist
        # Handle division by zero
        if denom == 0:
            scores[i, 0] = 0
        else:
            scores[i, 0] = num / denom
    return scores, radius


def _norm_by_clas(scores, targets):
    # Normalize by class
    classes = np.unique(targets)
    for class_ in classes:
        mm_class_ = MinMaxScaler()

        mask = (targets == class_)
        scores[mask] = mm_class_.fit_transform(scores[mask])


def recompute_radius(idx, radius, dataset, targets, n_jobs=1):
    n = idx.shape[0]
    m = dataset.shape[1]
    for i in range(n):
        id = idx[i]
        instance = dataset[id, :]
        target = targets[id]
        max_dist = math.inf
        for j in range(n):
            o_id = idx[j]
            o_instance = dataset[o_id, :]
            o_target = targets[o_id]
            if o_target != target:
                dist = c_euclidean(instance, o_instance, m)
                if dist < max_dist:
                    max_dist = dist
        radius[id, 0] = max_dist
    return radius


def relevants(idx, scores, radius, threshold, dataset, targets):
    selected_set = []
    selected_radius = []
    n, m = dataset.shape
    for i in range(n):
        id = idx[i]
        score = scores[id, 0]
        if score < threshold:
            break
        instance = dataset[id, :]
        target = targets[id]
        for j in range(len(selected_set)):
            s_id = selected_set[j]
            another_instance = dataset[s_id, :]
            another_target = targets[s_id]
            r = radius[s_id, 0]
            if another_target == target:
                dist = c_euclidean(instance, another_instance, m)

                if dist < r:
                    break
        else:
            selected_set.append(id)
            selected_radius.append(radius[id])
    return selected_set, selected_radius


def c_euclidean(a, b, s):
    v = 0
    for c in range(s):
        v += (a[c] - b[c]) ** 2
    return math.sqrt(v)


def euclidean(a, b):
    return c_euclidean(a, b, len(a))


def RIS1(dataset, targets, threshold, n_jobs=1):
    scores, radius = _scores_radius(dataset, targets, n_jobs)
    mm.fit_transform(scores)
    scores = np.round(scores, decimals=5)
    idx = scores.argsort(None)[::-1]
    idx = idx.astype(int)
    radius = recompute_radius(idx, radius, dataset, targets, n_jobs=1)
    _rels, radius = relevants(idx, scores, radius, threshold, dataset, targets)
    return dataset[_rels], targets[_rels], np.array(radius).flatten()


def classify(X_test, X_selection, radius):
    # Sum const to avoid division by zero
    radius_temp = radius + 1e-8

    # Compute distance between Test and Selection instances
    dists = euclidean_distances(X_test, X_selection)
    dists = dists / radius_temp

    # Get index of train samples to get class label
    index = np.argmin(dists, axis=1)

    return index