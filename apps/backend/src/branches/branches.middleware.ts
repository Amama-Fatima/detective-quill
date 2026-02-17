import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { ProjectsService } from "../projects/projects.service";

@Injectable()
export class BranchesMiddleware implements NestMiddleware {
  constructor(private readonly projectsService: ProjectsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const projectId = req.params.projectId;
    const userId = req["user"]?.id;

    await this.projectsService.verifyProjectOwnership(projectId, userId);

    next();
  }
}
