/*
  Warnings:

  - A unique constraint covering the columns `[qrcode]` on the table `Animal` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Animal_qrcode_key` ON `Animal`(`qrcode`);
