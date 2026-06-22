/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ICardService, IHoldingService, IWishlistService, IBinderService, IPriceService, IGoalService, ISettingsService } from './interfaces';
import {
  supabaseCardService,
  supabaseHoldingService,
  supabaseWishlistService,
  supabaseBinderService,
  supabasePriceService,
  supabaseGoalService,
  supabaseSettingsService
} from './supabase.service';

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
    this.cards = supabaseCardService;
    this.holdings = supabaseHoldingService;
    this.wishlist = supabaseWishlistService;
    this.binders = supabaseBinderService;
    this.prices = supabasePriceService;
    this.goals = supabaseGoalService;
    this.settings = supabaseSettingsService;
  }
}

export const services = new ServiceProvider();
export type { ICardService, IHoldingService, IWishlistService, IBinderService, IPriceService, IGoalService, ISettingsService };

