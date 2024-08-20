data_sets = [
    15, 7, 15, 11, 8;
    10, 8, 12, 9, 6;
    8, 6, 11, 7, 9;
    9, 9, 8, 10, 8;
    2, 1, 1, 1, 1
];

matrix = data_sets;

ranked_matrix = assign_ranks_based_on_indices(matrix);

final_matrix = process_duplicates(matrix, ranked_matrix);

final_result = mean(final_matrix, 1);
