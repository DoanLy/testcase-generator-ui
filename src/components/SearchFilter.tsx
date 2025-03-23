import React from "react";
import "./SearchFilter.css";

interface SearchFilterProps {
  onSearch: (searchTerm: string) => void;
  onFilterChange: (filter: string) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  onSearch,
  onFilterChange,
}) => {
  return (
    <div className="search-filter">
      <div className="search-box">
        <input
          type="text"
          placeholder="Search test cases..."
          onChange={(e) => onSearch(e.target.value)}
        />
        <i className="search-icon fas fa-search"></i>
      </div>
      <div className="filter-box">
        <select onChange={(e) => onFilterChange(e.target.value)}>
          <option value="">All Status</option>
          <option value="passed">Passed</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
        </select>
        <select onChange={(e) => onFilterChange(e.target.value)}>
          <option value="">All Modules</option>
          <option value="auth">Authentication</option>
          <option value="user">User Management</option>
          <option value="payment">Payment</option>
          <option value="report">Report</option>
        </select>
      </div>
    </div>
  );
};

export default SearchFilter;
