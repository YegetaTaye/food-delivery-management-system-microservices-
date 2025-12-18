import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../types/AppError';

export const getAllMenuItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId, isAvailable } = req.query;
    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (isAvailable !== undefined) where.isAvailable = isAvailable === 'true';

    const items = await prisma.menuItem.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

export const getMenuItemById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await prisma.menuItem.findUnique({
      where: { id: req.params.id },
      include: { category: true },
    });
    if (!item) throw new AppError('Menu item not found', 404);
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

export const createMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await prisma.category.findUnique({ where: { id: req.body.categoryId } });
    if (!category) throw new AppError('Category not found', 404);

    const item = await prisma.menuItem.create({
      data: req.body,
      include: { category: true },
    });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

export const updateMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.menuItem.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError('Menu item not found', 404);

    if (req.body.categoryId) {
      const category = await prisma.category.findUnique({ where: { id: req.body.categoryId } });
      if (!category) throw new AppError('Category not found', 404);
    }

    const item = await prisma.menuItem.update({
      where: { id: req.params.id },
      data: req.body,
      include: { category: true },
    });
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

export const deleteMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.menuItem.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError('Menu item not found', 404);

    await prisma.menuItem.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const reserveStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    for (const item of req.body.items) {
      const menuItem = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } });
      if (!menuItem) throw new AppError(`Menu item ${item.menuItemId} not found`, 404);
      if (menuItem.stock < item.quantity) {
        throw new AppError(`Insufficient stock for ${menuItem.name}`, 400);
      }
      await prisma.menuItem.update({
        where: { id: item.menuItemId },
        data: { stock: { decrement: item.quantity } },
      });
    }
    res.json({ success: true, message: 'Stock reserved' });
  } catch (err) {
    next(err);
  }
};

export const releaseStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    for (const item of req.body.items) {
      await prisma.menuItem.update({
        where: { id: item.menuItemId },
        data: { stock: { increment: item.quantity } },
      });
    }
    res.json({ success: true, message: 'Stock released' });
  } catch (err) {
    next(err);
  }
};
