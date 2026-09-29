import type { Dispatch, SetStateAction } from "react";

import * as cosmosService from "@/services/cosmosService";
import type { CosmosPost } from "@/services/cosmosService";

export function usePostLikes(setPosts: Dispatch<SetStateAction<CosmosPost[] | null>>) {
  return async (post: CosmosPost) => {
    const wasLiked = post.my_reaction === "like";
    const apply = (mine: string | null, count: number) =>
      setPosts((prev) => prev?.map((p) => (p.id === post.id ? { ...p, my_reaction: mine, reaction_count: count } : p)) ?? null);

    apply(wasLiked ? null : "like", Math.max(0, post.reaction_count + (wasLiked ? -1 : 1)));
    try {
      const res = await cosmosService.toggleLike(post.id);
      apply(res.type, res.reaction_count);
    } catch {
      apply(post.my_reaction, post.reaction_count);
    }
  };
}
