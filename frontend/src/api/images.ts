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
  engine: "gemini" | "volcengine" | "nano_banana";
}

export interface UpdateEngineResponse {
  success: boolean;
  engine: string;
}

export interface GetEngineResponse {
  engine: "gemini" | "volcengine" | "nano_banana";
}

export interface SelectImageResponse {
  success: boolean;
  sid: string;
  selected_image_hash: string;
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
    engine: "gemini" | "volcengine" | "nano_banana"
  ): Promise<UpdateEngineResponse> {
    return api.put<UpdateEngineResponse>(`/slides/${slug}/engine`, {
      engine,
    });
  },

  /**
   * Select which image to display for a slide
   */
  selectImage(
    slug: string,
    sid: string,
    hash: string
  ): Promise<SelectImageResponse> {
    return api.put<SelectImageResponse>(
      `/slides/${slug}/${sid}/selected-image`,
      { hash }
    );
  },

  /**
   * Export project as ZIP file with numbered JPG images
   */
  async exportProject(slug: string): Promise<Blob> {
    const response = await fetch(`/api/slides/${slug}/export`);
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }
    return response.blob();
  },
};
