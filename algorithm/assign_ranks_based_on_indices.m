function result = assign_ranks_based_on_indices(matrix)
    [rows, cols] = size(matrix);
    result = zeros(size(matrix));

    for i = 1:rows
        [~, sorted_indices] = sort(matrix(i, :), 'descend');
        rank = zeros(1, cols);
        rank(sorted_indices) = 1:cols;
        result(i, :) = rank;
    end
end
