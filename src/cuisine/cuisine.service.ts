import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Cuisine } from './entities/cuisine.entity';
import { CreateCuisineDto } from './dto/create-cuisine.dto';
import { UpdateCuisineDto } from './dto/update-cuisine.dto';
import { CuisineResponseDto } from './dto/response.dto';
import { CuisinePaginationDto } from './dto/pagination.dto';

@Injectable()
export class CuisineService {
  constructor(
    @InjectRepository(Cuisine)
    private readonly cuisineRepository: Repository<Cuisine>,
  ) {}

  // add new cuisine
  async create(createCuisineDto: CreateCuisineDto): Promise<CuisineResponseDto> {
    try {
      // first letter capital and other will be small
      const normalizedName =
        createCuisineDto.name.charAt(0).toUpperCase() +
        createCuisineDto.name.slice(1).toLowerCase();

      // checkf if cuisine already exists
      const existing = await this.cuisineRepository.findOne({
        where: { name: normalizedName },
      });
      if (existing) {
        throw new BadRequestException(`Cuisine ${normalizedName} already exists`);
      }

      const cuisine = this.cuisineRepository.create({ name: normalizedName });
      const saved = await this.cuisineRepository.save(cuisine);

      return { id: saved.id, name: saved.name };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // search cuisine
  async findAll( query: CuisinePaginationDto,): Promise<{ data: CuisineResponseDto[]; total: number; page: number; limit: number; message?: string }> {
    const { page = 1, limit = 10, search } = query;

    try {
      const qb = this.cuisineRepository
        .createQueryBuilder('cuisine')
        .orderBy('cuisine.name', 'ASC')
        .skip((page - 1) * limit)
        .take(limit);

      // search by id or name 
      if (search) {
        if (!isNaN(Number(search))) {
          qb.where('cuisine.id = :id', { id: Number(search) });
        } else {
          qb.where('cuisine.name ILIKE :name', { name: `%${search}%` });
        }
      }


      const [cuisines, total] = await qb.getManyAndCount();

      const data: CuisineResponseDto[] = cuisines.map(({ id, name }) => ({
        id,
        name,
      }));

      return {
        data,
        total,
        page,
        limit,
        message: data.length === 0 ? 'No cuisines found' : undefined,
      };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }


  // search cuisine by id
  async findOne(id: number):Promise<Cuisine> {
    try {
      const cuisine = await this.cuisineRepository.findOne({
        where: { id },
      });
      if (!cuisine) {
        throw new NotFoundException(`Cuisine with ID ${id} not found`);
      }
      return {id: cuisine.id, name: cuisine.name} as Cuisine;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  // update the cuisine name if want
  async update(id: number, updateCuisineDto: UpdateCuisineDto): Promise<CuisineResponseDto> {
    try {
      const cuisine = await this.cuisineRepository.findOne({ where: { id } });

      if (!cuisine) {
        throw new NotFoundException(`Cuisine with ID "${id}" not found`);
      }

      // normilizatioin
      const normalizedName =
        updateCuisineDto.name.charAt(0).toUpperCase() +
        updateCuisineDto.name.slice(1).toLowerCase();

      // checking duplication
      const existingCuisine = await this.cuisineRepository.findOne({
        where: { name: normalizedName },
      });

      if (existingCuisine && existingCuisine.id !== id) {
        throw new BadRequestException(
          `Cuisine with name ${normalizedName} already exists`,
        );
      }

      // update
      cuisine.name = normalizedName;
      const updatedCuisine = await this.cuisineRepository.save(cuisine);

      return { id: updatedCuisine.id, name: updatedCuisine.name };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }


  // delete the cuisine 
  async remove(id: number): Promise<{ message: string }> {
    try {
      const result = await this.cuisineRepository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException(`Cuisine with ID ${id} not found `);
      }

      return { message: `Cuisine with ID ${id} deleted successfully` };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // find cuisines by ids
  async findAllByNames(names: string[]): Promise<Cuisine[]> {
    try {
      const cuisines = await this.cuisineRepository
        .createQueryBuilder('cuisine')
        .where('LOWER(cuisine.name) IN (:...names)', {
          names: names.map(n => n.toLowerCase()),
        })
        .getMany();

      return cuisines;
    } catch (error) {
      throw new BadRequestException(`Failed to fetch cuisines: ${error.message}`);
    }
  }




}
