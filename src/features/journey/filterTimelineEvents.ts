/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { JourneyEvent } from './types';

export interface FilterTimelineParams {
  timelineEvents: JourneyEvent[];
  searchQuery: string;
  selectedBinderId: string;
  eventTypeFilter: string;
  sortByRecent: boolean;
}

export function filterTimelineEvents(params: FilterTimelineParams): JourneyEvent[] {
  const { timelineEvents, searchQuery, selectedBinderId, eventTypeFilter, sortByRecent } = params;
  let list = [...timelineEvents];

  if (searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase();
    list = list.filter(event =>
      event.card.name.toLowerCase().includes(query) ||
      event.card.set.toLowerCase().includes(query) ||
      (event.description && event.description.toLowerCase().includes(query))
    );
  }
  if (selectedBinderId !== 'ALL') {
    list = list.filter(event => event.holding.binderId === selectedBinderId);
  }
  if (eventTypeFilter !== 'ALL') {
    list = list.filter(event => event.type === eventTypeFilter);
  }
  list.sort((a, b) => {
    if (a.date !== b.date) {
      return sortByRecent ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date);
    }
    return b.id.localeCompare(a.id);
  });
  return list;
}
