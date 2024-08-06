import React from 'react'
import { DataGrid } from '@mui/x-data-grid';
import './TableComponent.css'
import CustomPagination from './CustomPagination';



const TableComponent = ({rows, columns}) => {
    const headerClass = 'header-dark';
    if (!columns)
    columns = [
        { field: 'id', headerName: 'ID', headerClassName: headerClass, width: 70 },
        { field: 'firstName', headerName: 'First name', headerClassName: headerClass, width: 130 },
        { field: 'lastName', headerName: 'Last name', headerClassName: headerClass, width: 130 },
        {
          field: 'age',
          headerName: 'Age',
          type: 'number',
          width: 90,
          headerClassName: headerClass
        },
        {
          field: 'fullName',
          headerName: 'Full name',
          description: 'This column has a value getter and is not sortable.',
          sortable: false,
          flex: 1,
          headerClassName: headerClass,
          valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`,
        },
      ];
    if (!rows)  
    rows = [
        { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
        { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
        { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
        { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
        { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
        { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
        { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
        { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
        { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
    ];
  columns.forEach(item => {
    item.headerClassName = headerClass;
  });    
  return (
    <div className="table-container" style={{height: '100%'}}>
      <DataGrid 
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 }
          },
        }}
        pageSizeOptions={[10, 50, 100]}
        style={{ color: 'white'}}
        components={{
          Pagination: CustomPagination, // Use the custom pagination component
        }}
      />
    </div>
  )
}

export default TableComponent