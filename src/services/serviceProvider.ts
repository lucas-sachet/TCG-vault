/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ICardService, IHoldingService, IWishlistService, IBinderService, IBinderSlotService, IPriceService, IGoalService, ISettingsService } from './interfaces';
import {
  supabaseCardService,
  supabaseHoldingService,
  supabaseWishlistService,
  supabaseBinderService,
  supabaseBinderSlotService,
  supabasePriceService,
  supabaseGoalService,
  supabaseSettingsService
} from './supabase.service';

class ServiceProvider {
  public cards: ICardService;
  public holdings: IHoldingService;
  public wishlist: IWishlistService;
  public binders: IBinderService;
  public binderSlots: IBinderSlotService;
  public prices: IPriceService;
  public goals: IGoalService;
  public settings: ISettingsService;

  constructor() {
    this.cards = supabaseCardService;
    this.holdings = supabaseHoldingService;
    this.wishlist = supabaseWishlistService;
    this.binders = supabaseBinderService;
    this.binderSlots = supabaseBinderSlotService;
    this.prices = supabasePriceService;
    this.goals = supabaseGoalService;
    this.settings = supabaseSettingsService;
  }
}

export const services = new ServiceProvider();
export type { ICardService, IHoldingService, IWishlistService, IBinderService, IBinderSlotService, IPriceService, IGoalService, ISettingsService };

