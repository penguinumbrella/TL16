import React from 'react';
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import { useGridApiContext, useGridSelector } from '@mui/x-data-grid';
import { gridPageCountSelector, gridPageSelector } from '@mui/x-data-grid';

const CustomPagination = () => {
  const apiRef = useGridApiContext();
  const page = useGridSelector(apiRef, gridPageSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);

  const handlePageChange = (event, value) => {
    apiRef.current.setPage(value - 1);
  };

  return (
    <Pagination
      count={pageCount}
      page={page + 1}
      onChange={handlePageChange}
      color="primary"
      renderItem={(item) => (
        <PaginationItem
          {...item}
          sx={{
            color: 'white',
            '&.Mui-selected': {
              color: 'white',
              backgroundColor: '#3f51b5',
            },
          }}
        />
      )}
    />
  );
};

export default CustomPagination;