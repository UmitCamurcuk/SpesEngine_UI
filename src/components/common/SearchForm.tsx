import React from 'react';
import Button from '../ui/Button';

interface SearchFormProps {
  onSearchInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  placeholder: string;
  searchButtonText: string;
  className?: string;
}

const SearchForm: React.FC<SearchFormProps> = ({
  onSearchInput,
  onSubmit,
  placeholder,
  searchButtonText,
  className = "flex w-full max-w-lg"
}) => {
  return (
    <form className={className} onSubmit={onSubmit}>
      <div className="relative flex-grow">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          className="block w-full p-2 pl-10 text-sm border border-gray-300 rounded-l-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder={placeholder}
          onChange={onSearchInput}
        />
      </div>
      <Button
        type="submit"
        variant="primary"
        className="rounded-l-none"
      >
        {searchButtonText}
      </Button>
    </form>
  );
};

export default SearchForm; 