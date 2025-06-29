import Fuse from "fuse.js";
import { useEffect, useRef, useState, useMemo } from "react";
import type { CollectionEntry } from "astro:content";
import { SearchIcon } from "lucide-react";

export type SearchItem = {
    title: string;
    description: string;
    data: CollectionEntry<"blog">["data"];
    postId: string;
};

interface Props {
    searchList: SearchItem[];
}

export default function Search({ searchList }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const fuse = useMemo(
        () =>
            new Fuse(searchList, {
                keys: ["title", "description"],
                includeMatches: true,
                minMatchCharLength: 2,
                threshold: 0.5
            }),
        [searchList]
    );

    const results = useMemo(() => {
        if (!query || query.length < 2) return [];
        return fuse.search(query);
    }, [fuse, query]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                setIsOpen(prev => !prev);
            }

            if (event.key === "Escape") {
                console.log("Escape key fired");
                event.preventDefault();
                setIsOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    return (
        <>
            <button className="group p-2" onClick={() => setIsOpen(true)}>
                <SearchIcon className="text-d-txt-base group-hover:text-d-accent size-4" />
                <span className="sr-only">Search</span>
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-20"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="bg-d-fill text-d-txt-base border-d-border/30 w-full max-w-xl rounded-lg border p-4 shadow-lg"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="relative">
                            <SearchIcon className="text-d-card-muted absolute top-3 left-3 size-5" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="how to do ..."
                                className="border-d-border w-full rounded-md border py-2 pr-4 pl-10"
                            />
                        </div>
                        <div className="mt-4">
                            {results.length > 0 ? (
                                <>
                                    <p className="mb-2 text-xs">
                                        {results.length} results found.
                                    </p>
                                    <ul className="max-h-96 space-y-2 overflow-y-auto">
                                        {results.map(({ item }) => (
                                            <li key={item.postId}>
                                                <a
                                                    href={`/posts/${item.postId}`}
                                                    className="hover:bg-d-card-muted/30 block rounded-md p-3"
                                                >
                                                    <h3
                                                        className="text-d-accent font-semibold"
                                                        // style={{
                                                        //     viewTransitionName:
                                                        //         item.postId
                                                        // }}
                                                    >
                                                        {item.title}
                                                    </h3>
                                                    <p className="text-sm">
                                                        {item.description}
                                                    </p>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : (
                                <p className="py-4 text-center">
                                    {query.length > 2
                                        ? "No results found."
                                        : "Search for anything..."}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
