import pandas as pd
import numpy as np
import random
from sklearn.cluster import AffinityPropagation
from heapq import nsmallest
class ClusterBasedOverUnderSampling:

    def check_data_type(self, var):
        if isinstance(var, pd.Series) or isinstance(var, pd.DataFrame):
            var = var.values
        return var

    def __init__(self, X_test, y_test):
        self.X_test = self.check_data_type(X_test)
        self.y_test = self.check_data_type(y_test)

        class_labels = np.unique(y_test)
        self.avg = len(y_test) // len(class_labels)
        # print("Average Size: {}".format(self.avg))

    def under_sample_data(self, MJ_class, MJ_class_data):
        items_after_us = list()
        # removed_indexes = list()

        MJ_class_size = MJ_class_data.shape[0]

        # clustering = AffinityPropagation(random_state=0,convergence_iter=20,max_iter=250,preference=-50)
        clustering = AffinityPropagation()
        clustering.fit(MJ_class_data)
        sub_clusters = clustering.labels_
        centers_indices = clustering.cluster_centers_indices_
        # print('centers_indices: {}', format(centers_indices))
        # print('MJ_class_size :', MJ_class_size)
        labels = clustering.labels_
        cluster_centers_indices = MJ_class_data.iloc[centers_indices, :].index
        # print('Here is the exception Booooommmmmmm')
        sub_clusters, sub_cluster_element_count = np.unique(sub_clusters, return_counts=True)
        NSTR_from_MJ_class = 0
        #     print("-" * 80)
        #     print("Class: {}, size: {}".format(MJ_class, MJ_class_size))
        for sub_cluster, sub_cluster_size in zip(sub_clusters, sub_cluster_element_count):
            NSTR = sub_cluster_size - round((sub_cluster_size * self.avg) / MJ_class_size)
            NSTR_from_MJ_class = NSTR_from_MJ_class + NSTR

            # print("sub_cluster:{},\tsub_cluster_size:{},\tremove:{}".format(sub_cluster, sub_cluster_size, NSTR))

            # sub_cluster_members = labels == sub_cluster
            # sub_cluster_elements = MJ_class_data[sub_cluster_members]
            # sub_cluster_elements_index_list = sub_cluster_elements.index
            sub_cluster_elements_mean = np.mean(MJ_class_data[labels == sub_cluster], axis=1)
            sub_cluster_center_index = cluster_centers_indices[sub_cluster]
            #         break
            distances = dict()
            # cc = 0
            for key in sub_cluster_elements_mean.keys():
                distance = abs(sub_cluster_elements_mean[sub_cluster_center_index] - sub_cluster_elements_mean[key])
                distances[key] = dict()
                distances[key] = distance

            N = int(sub_cluster_size - NSTR)
            items_closed_to_centroid = nsmallest(N, distances, key=distances.get)
            items_after_us.extend(items_closed_to_centroid)
            # print("items_closed_to_centroid: {}\n".format(items_closed_to_centroid))

        #         all_indexes = sub_cluster_elements_index_list.to_list()
        #         removed_index = list(set(all_indexes) - set(items_closed_to_centroid))
        #         removed_indexes.extend(removed_index)

        # print("\nClass: {}, size:{}, Remove:{}, After US:{}\n".format(MJ_class, MJ_class_size,NSTR_from_MJ_class, (MJ_class_size-NSTR_from_MJ_class)))
        #     print('+' * 10)
        # print("After US size: {}\n".format(items_after_us))

        features = self.X_test[items_after_us, :]
        # print("features: {}\n".format(len(features)))
        labels = self.y_test[items_after_us]

        # print("labels: {}\n".format(labels))
        all_data = np.append(features, labels.reshape(-1, 1), axis=1)
        df_sample = pd.DataFrame(all_data, index=items_after_us)
        df_sample.iloc[:, -1] = df_sample.iloc[:, -1].astype(int)
        # print("all_data: {}\n".format(all_data))

        return df_sample

    def over_sample_data(self, MI_class, MI_class_data):

        # MI_class_data = minority[MI_class]['values']
        MI_class_size = MI_class_data.shape[0]

        # clustering = AffinityPropagation(convergence_iter=20)
        clustering = AffinityPropagation()
        clustering.fit(MI_class_data)
        sub_clusters = clustering.labels_

        centers_indices = clustering.cluster_centers_indices_
        labels = clustering.labels_

        cluster_centers_indices = MI_class_data.iloc[centers_indices, :].index

        sub_clusters, sub_cluster_element_count = np.unique(sub_clusters, return_counts=True)
        NSTA_into_MI_class = 0
        items_after_os = list()
        generated = list()
        #     print("Class: {}, size: {}".format(MI_class, MI_class_size))
        for sub_cluster, sub_cluster_size in zip(sub_clusters, sub_cluster_element_count):
            NSTA = round((sub_cluster_size * self.avg) / MI_class_size) - sub_cluster_size
            NSTA_into_MI_class = NSTA_into_MI_class + NSTA

            # N_STA = int(NSTA)
            #         print("sub_cluster:{},\tsub_cluster_size:{},\tadd:{}".format(sub_cluster, sub_cluster_size, N_STA))

            # When NSTA Value is zero then do not adding item to cluster
            #         if not bool(NSTA):
            #             continue

            sub_cluster_members = labels == sub_cluster
            sub_cluster_elements = MI_class_data[sub_cluster_members]
            sub_cluster_elements_index_list = sub_cluster_elements.index
            sub_cluster_elements_mean = np.mean(MI_class_data[labels == sub_cluster], axis=1)
            sub_cluster_center_index = cluster_centers_indices[sub_cluster]
            sub_cluster_center_mean = sub_cluster_elements_mean[sub_cluster_center_index]

            # here need to add NSTA new sample, so generate NSTA sample that are very similar to the existing samples in the
            # current cluster

            # N = int(sub_cluster_size + NSTA)
            # approach would be select NSTA sample which are away from the center and than generate NSTA sample similare to
            # those

            N = int(NSTA)
            distances = dict()
            for key in sub_cluster_elements_mean.keys():
                distance = abs(sub_cluster_elements_mean[sub_cluster_center_index] - sub_cluster_elements_mean[key])
                distances[key] = dict()
                distances[key] = distance

            # items_away_from_centroid = nlargest(N, distances, key = distances.get)
            items_away_from_centroid = nsmallest(N, distances,
                                                 key=distances.get)  # lets try nearest sample for oversamping 16-06-21

            item = 0
            for item in range(len(items_away_from_centroid)):
                items_after_os.append(items_away_from_centroid[item])

            #         print("Means of selected rows: {}".format(sub_cluster_elements_mean))
            #         print("Items selected for OS: ",MI_class_data[labels == sub_cluster])
            #         print("Indexes of selected rows: {}".format(items_after_os))

            #         synthetic_item = Xi + (Xi - Xj) * sub_cluster_center_mean
            #         Xi individual item of minority class in the selected items
            #         Xj individual any item of minority class in the selected items

            #         sort_distances = sorted(distances.items(), key=lambda x: x[1], reverse=True)
            #         sort_distances
            #         print("difference: ",difference.item())

            #         res = dict(sorted(difference.items(), key = itemgetter(1), reverse = True)[:N])
            #         print("Top {} itmes: {}".format(NSTR,remaining_items))
            #         print("mean at center is {}  minus item mean {} = {}".format(sub_cluster_elements_mean[sub_cluster_center_index],sub_cluster_elements_mean[key],difference))
            #         break

            element_away = items_away_from_centroid.copy()  # This is list
            N_samples_to_add = int(NSTA)
            #         generated = list()
            # num_new_rows = len(items_away_from_centroid)
            new_count = sub_cluster_size + N_samples_to_add
            #         print("\t\tAdding {} new rows in existing {} rows = {}...".format(N_samples_to_add, sub_cluster_size, new_count))
            for x in range(new_count):
                num_rows = x + 1

                normal_flow = True
                if num_rows <= N_samples_to_add and bool(element_away):
                    an_index = element_away.pop()
                #                 print(num_rows, ": Picked index {} for data normally".format(an_index))
                elif N_samples_to_add > sub_cluster_size:
                    normal_flow = False
                    an_index = random.choice(items_away_from_centroid)
                #                 print(num_rows, ": Random index {} is picked".format(an_index))
                else:
                    #                 print("Do Nothing")
                    normal_flow = None

                if normal_flow is None:
                    curr_elements = sub_cluster_elements.values.tolist()
                    generated.extend(curr_elements)
                    break

                row_values = sub_cluster_elements[sub_cluster_elements_index_list == an_index].values.flatten()
                last_col_num = row_values.shape[0] - 1
                cluster_center_last_col_val = sub_cluster_elements.iloc[
                    sub_cluster_elements_index_list == sub_cluster_center_index, last_col_num].values[0]

                generate_values = list()
                for col_num, val in enumerate(row_values):
                    xi = val
                    if col_num == last_col_num:
                        xj = cluster_center_last_col_val
                    else:
                        next_column_index = col_num + 1
                        if normal_flow:
                            xj = row_values[next_column_index]
                        else:
                            index_other = random.choice(items_away_from_centroid)
                            other = sub_cluster_elements.iloc[
                                sub_cluster_elements_index_list == index_other, next_column_index]
                            xj = other.values.flatten()[0]

                    generate_value = random.uniform(0.001,
                                                    0.005) + xi  # Thia formula preformed better than the orignal formula
                    # generate_value = xi + (abs(xi - xj)) * sub_cluster_center_mean # original formula
                    # generate_value =  (abs(xi - xj)) * sub_cluster_center_mean # changed for improving acc for class 0 : 15 june 21
                    generate_values.append(generate_value)
                generated.append(generate_values)

        generated_data = np.array(generated)
        synthetic_data = pd.DataFrame(generated_data)

        last_column = synthetic_data.columns.shape[0]
        synthetic_data[last_column] = MI_class

        return synthetic_data

    def fit(self):

        true_labels = np.unique(self.y_test)
        # df_list = dict()
        majority = dict()
        minority = dict()

        all_data = list()
        # all_balanced_data = list()
        for cluster_number in true_labels:
            class_size = np.count_nonzero(self.y_test == cluster_number)
            # sample_diff = class_size - self.avg
            row_ix = np.where(self.y_test == cluster_number)
            indexes = row_ix[0]
            data = pd.DataFrame(self.X_test[indexes, :], index=indexes)

            if class_size > self.avg:
                majority[cluster_number] = dict()
                majority[cluster_number]['values'] = data
                # print("{}: {} - major".format(cluster_number, data.shape[0]))

                # Perform Under Sampling of Data
                df_data = self.under_sample_data(cluster_number, data)
                # print("After Under Sample Data For Class # {}: {}".format(cluster_number, df_data.shape))
                all_data.append(df_data)
            else:
                minority[cluster_number] = dict()
                minority[cluster_number]['values'] = data
                # print("{}: {} - minor".format(cluster_number, data.shape[0]))

                # Perform Over Sampling of Data
                df_data = self.over_sample_data(cluster_number, data)
                # print("After Over Sampled Data For Class # {}: {}".format(cluster_number, df_data.shape))
                all_data.append(df_data)

        balanced_data = pd.concat(all_data, axis=0, ignore_index=True)
        x = balanced_data.iloc[:, :-1]
        y = balanced_data.iloc[:, -1]

        return x, y


# 使用 ClusterBasedOverUnderSampling 平衡数据集
def CBHSID(X, y):
    sampler = ClusterBasedOverUnderSampling(X, y)
    X_balanced, y_balanced = sampler.fit()
    return X_balanced, y_balanced
