import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Footer } from '../../entities/footer.entity';

@Injectable()
export class FooterFrontendService {
  private readonly logger = new Logger(FooterFrontendService.name);

  constructor(
    @InjectRepository(Footer)
    private readonly footerRepository: Repository<Footer>,
  ) {}

  async getActiveFooter() {
    try {
      this.logger.debug('Fetching active footer');
      
      const footer = await this.footerRepository.findOne({
        where: { isActive: true },
      });

      this.logger.debug(`Found footer: ${footer ? 'yes' : 'no'}`);
      if (footer) {
        this.logger.debug(`Footer data: ${JSON.stringify(footer)}`);
      }

      if (!footer) {
        return null;
      }

      return {
        id: footer.id,
        name: footer.name,
        addresses: footer.addresses,
        mapUrl: footer.mapUrl,
        fanpageUrl: footer.fanpageUrl,
        companyInfo: footer.companyInfo,
        quickLinks: footer.quickLinks,
        backgroundLightColor: footer.backgroundLightColor,
        backgroundDarkColor: footer.backgroundDarkColor,
        copyrightStyle: footer.copyrightStyle,
        socialIcons: footer.socialIcons,
        logoUrl: footer.logoUrl,
        logoAlt: footer.logoAlt,
        branchInfo: footer.branchInfo,
        isActive: footer.isActive,
        createdAt: footer.createdAt,
        updatedAt: footer.updatedAt,
        componentName: footer.componentName,
      };
    } catch (error) {
      console.log(error);
      this.logger.error('Error fetching active footer:', error);
      throw error;
    }
  }
} 