import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from "class-validator";

export class CreateContributionDto {
  @IsIn(["save", "commit"])
  contribution_type: "save" | "commit";

  @IsOptional()
  @IsUUID()
  reference_id?: string;

  @IsOptional()
  @IsString()
  contribution_date?: string;
}

export class GetMonthlyContributionsQueryDto {
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  @IsInt()
  @Min(1)
  @Max(12)
  month: number;
}
