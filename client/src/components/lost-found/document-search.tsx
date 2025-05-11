import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { documentTypes } from "@/lib/utils";

interface DocumentSearchProps {
  onSearch: (filters: { query: string; type: string; location: string }) => void;
}

export function DocumentSearch({ onSearch }: DocumentSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [location, setLocation] = useState("");

  const handleSearch = () => {
    onSearch({
      query,
      type: selectedType,
      location,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setQuery("");
    setSelectedType("all");
    setLocation("");
    onSearch({ query: "", type: "all", location: "" });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search documents..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-4 py-2 border border-lightGray rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <i className="ri-search-line absolute left-3 top-2.5 text-darkGray"></i>
      </div>
      <div className="flex mt-3 overflow-x-auto pb-1 hide-scrollbar">
        <Button
          variant={selectedType === "all" ? "outline" : "ghost"}
          size="sm"
          onClick={() => setSelectedType("all")}
          className={`border ${
            selectedType === "all" 
              ? "border-primary text-primary" 
              : "border-lightGray text-darkGray"
          } rounded-full px-3 py-1 text-sm mr-2 whitespace-nowrap`}
        >
          All Types
        </Button>
        {documentTypes.map((type) => (
          <Button
            key={type.id}
            variant={selectedType === type.id ? "outline" : "ghost"}
            size="sm"
            onClick={() => setSelectedType(type.id)}
            className={`border ${
              selectedType === type.id 
                ? "border-primary text-primary" 
                : "border-lightGray text-darkGray"
            } rounded-full px-3 py-1 text-sm mr-2 whitespace-nowrap`}
          >
            {type.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
