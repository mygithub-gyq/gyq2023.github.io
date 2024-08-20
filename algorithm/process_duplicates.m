function ranked_matrix = process_duplicates(matrix, ranked_matrix)
    [rows, cols] = size(matrix);
    for i = 1:rows
        [unique_elements, ~, indices] = unique(matrix(i, :));
        counts = histc(indices, unique(indices));
        for j = 1:length(unique_elements)
            if counts(j) > 1
                duplicate_indices = find(matrix(i, :) == unique_elements(j));
                avg_rank = mean(ranked_matrix(i, duplicate_indices));
                ranked_matrix(i, duplicate_indices) = avg_rank;
            end
        end
    end
end
