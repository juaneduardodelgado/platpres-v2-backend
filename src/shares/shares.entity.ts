import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ShareModel {
    @PrimaryGeneratedColumn()
    @ApiPropertyOptional({ type: Number })
    id?: number;
  }