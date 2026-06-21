/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ICardService, IHoldingService, IWishlistService, IBinderService, IPriceService, IGoalService, ISettingsService } from './interfaces';
import { LocalStorageCardService } from './cards.service';
import { LocalStorageHoldingService } from './collection.service';
import { LocalStorageWishlistService } from './wishlist.service';
import { LocalStorageBinderService } from './binder.service';
import { LocalStoragePriceService } from './priceHistory.service';
import { 
  LocalStorageGoalService, 
  LocalStorageSettingsService 
} from './localStorageService';

class ServiceProvider {
  public cards: ICardService;
  public holdings: IHoldingService;
  public wishlist: IWishlistService;
  public binders: IBinderService;
  public prices: IPriceService;
  public goals: IGoalService;
  public settings: ISettingsService;

  constructor() {
    // Centrally swap implementations here for future PostgreSQL, Supabase, or REST APIs migrations
    this.cards = new LocalStorageCardService();
    this.holdings = new LocalStorageHoldingService();
    this.wishlist = new LocalStorageWishlistService();
    this.binders = new LocalStorageBinderService();
    this.prices = new LocalStoragePriceService();
    this.goals = new LocalStorageGoalService();
    this.settings = new LocalStorageSettingsService();
  }
}

export const services = new ServiceProvider();
export type { ICardService, IHoldingService, IWishlistService, IBinderService, IPriceService, IGoalService, ISettingsService };
