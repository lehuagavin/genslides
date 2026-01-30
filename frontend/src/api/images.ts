/**
 * Images API client
 */

import type { SlideImage, GenerateTaskResponse } from "@/types";
import { api } from "./client";

export interface GetImagesResponse {
  sid: string;
  content_hash: string;
  images: SlideImage[];
  has_matched_image: boolean;
}

export interface GenerateImageRequest {
  force?: boolean;
}

export interface DeleteImageResponse {
  success: boolean;
  deleted_hash: string;
}

export interface UpdateEngineRequest {
  engine: "gemini" | "volcengine";
}

export interface UpdateEngineResponse {
  success: boolean;
  engine: string;
}

export interface GetEngineResponse {
  engine: "gemini" | "volcengine";
}

export const imagesApi = {
  /**
   * Get all images for a slide
   */
  getImages(slug: string, sid: string): Promise<GetImagesResponse> {
    return api.get<GetImagesResponse>(`/slides/${slug}/${sid}/images`);
  },

  /**
   * Generate image for a slide
   */
  generateImage(
    slug: string,
    sid: string,
    force = false
  ): Promise<GenerateTaskResponse> {
    return api.post<GenerateTaskResponse>(`/slides/${slug}/${sid}/generate`, {
      force,
    });
  },

  /**
   * Delete an image from a slide
   */
  deleteImage(
    slug: string,
    sid: string,
    imageHash: string
  ): Promise<DeleteImageResponse> {
    return api.delete<DeleteImageResponse>(
      `/slides/${slug}/${sid}/images/${imageHash}`
    );
  },

  /**
   * Get current image generation engine
   */
  getEngine(slug: string): Promise<GetEngineResponse> {
    return api.get<GetEngineResponse>(`/slides/${slug}/engine`);
  },

  /**
   * Update image generation engine
   */
  updateEngine(
    slug: string,
    engine: "gemini" | "volcengine"
  ): Promise<UpdateEngineResponse> {
    return api.put<UpdateEngineResponse>(`/slides/${slug}/engine`, {
      engine,
    });
  },
};
