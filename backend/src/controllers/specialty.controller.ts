import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { SpecialtyModel } from "../models/specialty.model";
import {
  sendSuccess,
  sendCreated,
  sendBadRequest,
  sendNotFound
} from "../helpers/response.helper";

/**
 * List all available specialties (public).
 */
export const listSpecialties = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const specialties = await SpecialtyModel.findAll();
    return sendSuccess(res, specialties, "Specialties retrieved successfully.");
  } catch (error: any) {
    next(error);
  }
};

/**
 * Get a single specialty by ID (public).
 */
export const getSpecialtyById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const specialty = await SpecialtyModel.findById(id);

    if (!specialty) {
      return sendNotFound(res, "Specialty not found.");
    }

    return sendSuccess(res, specialty, "Specialty retrieved successfully.");
  } catch (error: any) {
    next(error);
  }
};

/**
 * Create a new specialty (Admin only).
 */
export const createSpecialty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return sendBadRequest(res, "Missing required field: name.");
    }

    const existing = await SpecialtyModel.findOne({ name });
    if (existing) {
      return sendBadRequest(res, `A specialty named "${name}" already exists.`);
    }

    const specialty = await SpecialtyModel.create({
      id: crypto.randomUUID(),
      name,
      description: description || null
    });

    return sendCreated(res, specialty, "Specialty created successfully.");
  } catch (error: any) {
    next(error);
  }
};

/**
 * Update specialty details (Admin only).
 */
export const updateSpecialty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const specialty = await SpecialtyModel.findById(id);
    if (!specialty) {
      return sendNotFound(res, "Specialty not found.");
    }

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;

    if (Object.keys(updates).length === 0) {
      return sendBadRequest(res, "No updatable fields provided.");
    }

    await SpecialtyModel.update(id, updates);
    const updated = await SpecialtyModel.findById(id);

    return sendSuccess(res, updated, "Specialty updated successfully.");
  } catch (error: any) {
    next(error);
  }
};

/**
 * Delete a specialty (Admin only).
 */
export const deleteSpecialty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const specialty = await SpecialtyModel.findById(id);
    if (!specialty) {
      return sendNotFound(res, "Specialty not found.");
    }

    await SpecialtyModel.delete(id);
    return sendSuccess(res, null, "Specialty deleted successfully.");
  } catch (error: any) {
    next(error);
  }
};
