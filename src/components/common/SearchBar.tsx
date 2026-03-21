import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search' }: SearchBarProps) {
  return (
    <label className="flex items-center gap-3 rounded-full border border-brand-ink/10 bg-white px-4 py-3 shadow-sm">
      <Search className="size-4 text-brand-gray" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm outline-none placeholder:text-brand-gray/80"
      />
    </label>
  );
}
