"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import type { WordSearchResult } from "@/lib/database";

interface SearchBoxProps {
	words: WordSearchResult[];
}

export function SearchBox({ words }: SearchBoxProps) {
	const [query, setQuery] = useState("");
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [isOpen, setIsOpen] = useState(false);
	const router = useRouter();
	const inputRef = useRef<HTMLInputElement>(null);

	const suggestions = useMemo(() => {
		if (!query.trim()) {
			// Show top 10 words by default when search is empty
			return words.slice(0, 10);
		}

		const lowerQuery = query.toLowerCase();
		return words
			.filter((w) => w.word.toLowerCase().startsWith(lowerQuery))
			.slice(0, 10); // Limit to top 10 suggestions
	}, [query, words]);

	const handleSelect = (word: WordSearchResult) => {
		const encodedWord = encodeURIComponent(word.word);
		const url =
			word.type === "odds" ? `/odds/${encodedWord}` : `/word/${encodedWord}`;
		router.push(url);
		setQuery("");
		setIsOpen(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (!suggestions.length) return;

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setSelectedIndex((prev) =>
					prev < suggestions.length - 1 ? prev + 1 : prev,
				);
				break;
			case "ArrowUp":
				e.preventDefault();
				setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
				break;
			case "Enter":
				e.preventDefault();
				if (suggestions[selectedIndex]) {
					handleSelect(suggestions[selectedIndex]);
				}
				break;
			case "Escape":
				setIsOpen(false);
				inputRef.current?.blur();
				break;
		}
	};

	return (
		<div className="relative w-full">
			<input
				ref={inputRef}
				type="text"
				value={query}
				onChange={(e) => {
					setQuery(e.target.value);
					setSelectedIndex(0);
					setIsOpen(true);
				}}
				onFocus={() => setIsOpen(true)}
				onBlur={() => {
					// Delay to allow click on suggestions
					setTimeout(() => setIsOpen(false), 200);
				}}
				onKeyDown={handleKeyDown}
				placeholder="Søg efter ord..."
				className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#C60C30] bg-white"
			/>

			{isOpen && suggestions.length > 0 && (
				<div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-[400px] overflow-y-auto">
					{suggestions.map((suggestion, index) => (
						<button
							key={`${suggestion.type}-${suggestion.word}`}
							type="button"
							onClick={() => handleSelect(suggestion)}
							className={`w-full px-6 py-3 text-left hover:bg-gray-100 flex justify-between items-center ${
								index === selectedIndex ? "bg-gray-100" : ""
							}`}
						>
							<span className="font-medium">{suggestion.word}</span>
							<span className="text-sm text-gray-500 flex items-center gap-2">
								{suggestion.type === "odds" && (
									<span className="px-2 py-0.5 bg-[#C60C30] text-white text-xs rounded">
										ODDS
									</span>
								)}
								<span>{suggestion.speechPercentage.toFixed(0)}%</span>
							</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
