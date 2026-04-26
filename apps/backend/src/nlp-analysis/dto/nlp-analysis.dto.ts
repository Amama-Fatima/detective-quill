import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { NlpEntity, NlpRelationship } from "@detective-quill/shared-types";

export class SubmitAnalysisDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(50, {
    message: "The scene text must be at least 50 characters long.",
  })
  @MaxLength(5000, {
    message: "The scene text must not exceed 5000 characters.",
  })
  scene_text!: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class AnalysisResponseDto {
  job_id!: string;
  status!: string;
  message!: string;
  polling_url!: string;
}

export class JobStatusDto {
  job_id!: string;
  status!: string;
  progress!: number;
  stage?: string;
  created_at!: string;
  completed_at?: string;
  error_message?: string;
}

export class AnalysisResultDto {
  job_id!: string;
  entities!: NlpEntity[];
  relationships!: NlpRelationship[];
  metadata!: {
    processing_time: string;
    entity_count: number;
    relationship_count: number;
  };
}
