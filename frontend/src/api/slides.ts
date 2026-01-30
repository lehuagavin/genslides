/**
 * Slides API client
 */

import type { Project, Slide, CostInfo, ProjectSummary } from "@/types";
import { api } from "./client";

export interface UpdateTitleResponse {
  slug: string;
  title: string;
  updated_at: string;
}

export interface CreateSlideRequest {
  content: string;
  after_sid?: string;
}

export interface UpdateSlideRequest {
  content: string;
}

export interface ReorderSlidesRequest {
  order: string[];
}

export interface ReorderSlidesResponse {
  success: boolean;
  slides: Slide[];
}

export interface DeleteSlideResponse {
  success: boolean;
  deleted_sid: string;
}

export interface ProjectListResponse {
  projects: ProjectSummary[];
}

export interface DeleteProjectResponse {
  success: boolean;
  deleted_slug: string;
}

export const slidesApi = {
  /**
   * List all projects
   */
  listProjects(): Promise<ProjectListResponse> {
    return api.get<ProjectListResponse>("/slides");
  },

  /**
   * Get project information
   */
  getProject(slug: string): Promise<Project> {
    return api.get<Project>(`/slides/${slug}`);
  },

  /**
   * Delete a project
   */
  deleteProject(slug: string): Promise<DeleteProjectResponse> {
    return api.delete<DeleteProjectResponse>(`/slides/${slug}`);
  },

  /**
   * Update project title
   */
  updateTitle(slug: string, title: string): Promise<UpdateTitleResponse> {
    return api.put<UpdateTitleResponse>(`/slides/${slug}/title`, { title });
  },

  /**
   * Create a new slide
   */
  createSlide(slug: string, data: CreateSlideRequest): Promise<Slide> {
    return api.post<Slide>(`/slides/${slug}`, data);
  },

  /**
   * Update slide content
   */
  updateSlide(slug: string, sid: string, content: string): Promise<Slide> {
    return api.put<Slide>(`/slides/${slug}/${sid}`, { content });
  },

  /**
   * Reorder slides
   */
  reorderSlides(
    slug: string,
    order: string[]
  ): Promise<ReorderSlidesResponse> {
    return api.put<ReorderSlidesResponse>(`/slides/${slug}/reorder`, { order });
  },

  /**
   * Delete a slide
   */
  deleteSlide(slug: string, sid: string): Promise<DeleteSlideResponse> {
    return api.delete<DeleteSlideResponse>(`/slides/${slug}/${sid}`);
  },

  /**
   * Get cost information
   */
  getCost(slug: string): Promise<CostInfo> {
    return api.get<CostInfo>(`/slides/${slug}/cost`);
  },
};
