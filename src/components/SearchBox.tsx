"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "@/i18n/routing";
import type { WordSearchResult } from "@/lib/database";

interface SearchBoxProps {
	words: WordSearchResult[];
	onClose?: () => void;
	autoFocus?: boolean;
	variant?: "default" | "compact";
}

export function SearchBox({
	words,
	onClose,
	variant = "default",
}: SearchBoxProps) {
	const t = useTranslations("search");
	const [query, setQuery] = useState("");
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [isOpen, setIsOpen] = useState(false);
	const [placeholder, setPlaceholder] = useState("");
	const [isFocused, setIsFocused] = useState(false);
	const router = useRouter();
	const inputRef = useRef<HTMLInputElement>(null);

	const suggestions = useMemo(() => {
		if (!query.trim()) {
			return words
				.filter((w: WordSearchResult) => {
					return w.type === "word" && !w.isStopword;
				})
				.slice(0, 8);
		}

		const lowerQuery = query.toLowerCase();
		return words
			.filter((w) => w.word.toLowerCase().startsWith(lowerQuery))
			.slice(0, 8);
	}, [query, words]);

	// Animated typing effect for placeholder (only for default variant)
	useEffect(() => {
		if (variant !== "default" || isFocused) {
			return;
		}

		const exampleWords = [
			"Søens Folk",
			"klimaforandringer",
			"sundhedspersonalet",
			"VM i fodbold",
			"Store Bededag",
		];

		let currentWordIndex = 0;
		let currentText = "";
		let isDeleting = false;
		let charIndex = 0;

		const typeSpeed = 50; // ms per character when typing
		const deleteSpeed = 50; // ms per character when deleting
		const pauseAfterWord = 2000; // ms to wait before deleting
		const pauseAfterDelete = 500; // ms to wait before typing next word

		const animate = () => {
			const currentWord = exampleWords[currentWordIndex];

			if (!isDeleting) {
				// Typing
				if (charIndex < currentWord.length) {
					currentText = currentWord.substring(0, charIndex + 1);
					setPlaceholder(currentText);
					charIndex++;
					return typeSpeed;
				}
				// Finished typing, wait then start deleting
				isDeleting = true;
				return pauseAfterWord;
			}
			// Deleting
			if (charIndex > 0) {
				charIndex--;
				currentText = currentWord.substring(0, charIndex);
				setPlaceholder(currentText);
				return deleteSpeed;
			}
			// Finished deleting, move to next word
			isDeleting = false;
			currentWordIndex = (currentWordIndex + 1) % exampleWords.length;
			return pauseAfterDelete;
		};

		let timeoutId: NodeJS.Timeout;
		const runAnimation = () => {
			const delay = animate();
			timeoutId = setTimeout(runAnimation, delay);
		};

		runAnimation();

		return () => {
			clearTimeout(timeoutId);
		};
	}, [variant, isFocused]);

	const handleSelect = (word: WordSearchResult) => {
		const encodedWord = encodeURIComponent(word.word);
		const url =
			word.type === "odds" ? `/odds/${encodedWord}` : `/word/${encodedWord}`;
		router.push(url);
		setQuery("");
		setIsOpen(false);
		onClose?.();
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
				onClose?.();
				break;
		}
	};

	const inputClasses =
		variant === "compact"
			? "w-full px-4 py-2 text-base border border-[#8A0A24] rounded-md focus:outline-none focus:border-[#8A0A24] bg-[#A00A28] text-white placeholder-white/70"
			: "w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#C60C30] bg-white";

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
				onFocus={() => {
					setIsOpen(true);
					setIsFocused(true);
					if (variant === "default") {
						setPlaceholder(t("placeholderAnimated"));
					}
				}}
				onBlur={() => {
					// Delay to allow click on suggestions
					setTimeout(() => setIsOpen(false), 200);
					setIsFocused(false);
				}}
				onKeyDown={handleKeyDown}
				placeholder={variant === "default" ? placeholder : t("placeholder")}
				className={inputClasses}
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
