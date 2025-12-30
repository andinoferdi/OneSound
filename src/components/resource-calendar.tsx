'use client';

import { useRef, useState, useLayoutEffect, startTransition } from 'react';

import { cn } from '@/lib/utils';
import type {
  DateSelectArg,
  DateSpanApi,
  DatesSetArg,
  EventApi,
  EventClickArg,
  EventContentArg,
  EventInput,
  EventChangeArg,
  EventRemoveArg,
  EventAddArg
} from '@fullcalendar/core';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import { ResourceInput } from '@fullcalendar/resource';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';

import { format, isWithinInterval } from 'date-fns';
import { isSameDay } from 'date-fns';

export type ResourceCalendarEvent = EventInput & {
  id: string;
  title: string;
  start: Date | string;
  end?: Date | string;
  resourceId: string;
  extendedProps?: Record<string, unknown>;
};

export type Resource = ResourceInput & {
  id: string;
  title: string;
  eventColor?: string;
  children?: Resource[];
};

export type AvailableDate = {
  start: Date;
  end: Date;
  resourceIds?: string[];
};

interface ResourceCalendarProps {
  events?: ResourceCalendarEvent[];
  resources?: Resource[];
  initialView?: 'resourceTimelineMonth' | 'resourceTimelineWeek' | 'resourceTimelineDay';
  editable?: boolean;
  selectable?: boolean;
  height?: string | number;
  headerToolbar?: {
    left?: string;
    center?: string;
    right?: string;
  };
  customButtons?: {
    [key: string]: {
      text: string;
      click: () => void;
    };
  };
  resourceGroupField?: string;
  resourceLabelContent?: string | ((arg: { resource: Resource }) => React.ReactNode);
  resourceLabelText?: string;
  resourceAreaWidth?: string;
  resourceAreaHeaderContent?: string;
  className?: string;
  slotMinWidth?: number;
  availableDates?: AvailableDate[];
  allowOverlapEvent?: boolean;
  restrictDragAndDropType?: 'group' | 'resource' | 'date' | 'group-date';
  resourceLabelDidMount?: (arg: { resource: Resource }) => void;
  onEventClick?: (event: EventClickArg) => void;
  eventContent?: (arg: EventContentArg) => React.ReactNode;
  dateClick?: (info: DateClickArg) => void;
  onDateSelect?: (selectInfo: DateSelectArg) => void;
  onEventAdd?: (event: ResourceCalendarEvent) => void;
  onEventChange?: (event: ResourceCalendarEvent) => void;
  onEventRemove?: (eventId: string) => void;
  onDatesSet?: (dateInfo: DatesSetArg) => void;
}

export function ResourceCalendar({
  events = [],
  resources = [],
  initialView = 'resourceTimelineMonth',
  editable = true,
  selectable = true,
  height = 'auto',
  headerToolbar = {
    left: 'prev,next today',
    center: 'title',
    right: 'disable enable'
  },
  resourceGroupField,
  resourceLabelContent,
  slotMinWidth,
  availableDates,
  restrictDragAndDropType,
  resourceAreaWidth = '15%',
  className,
  customButtons,
  resourceAreaHeaderContent,
  allowOverlapEvent = true,
  resourceLabelDidMount,
  onEventClick,
  dateClick,
  onDateSelect,
  onEventAdd,
  onEventChange,
  onEventRemove,
  onDatesSet,
  eventContent
}: ResourceCalendarProps) {
  const [mounted, setMounted] = useState(false);

  // Generate background events for available dates
  const generateAvailabilityBackgroundEvents = () => {
    if (!availableDates || availableDates.length === 0) {
      return []; 
    }

    const backgroundEvents: EventInput[] = [];

    const allResourceIds = resources.reduce<string[]>((acc, resource) => {
      if (resource.children) {
        return [
          ...acc,
          ...resource.children.map((child: Resource) => child.id).filter((id: string | undefined): id is string => typeof id === 'string')
        ];
      }
      return resource.id ? [...acc, resource.id] : acc;
    }, []);

    availableDates.forEach((availableDate, index) => {
      const resourceIds = availableDate.resourceIds || allResourceIds;

      resourceIds.forEach((resourceId) => {
        backgroundEvents.push({
          id: `availability-bg-${index}-${resourceId}`,
          start: availableDate.start,
          end: availableDate.end,
          resourceId: resourceId,
          display: 'background',
          backgroundColor: 'oklch(0.546 0.245 142 / 0.4)', 
          rendering: 'background',
          allDay: true,
          extendedProps: {
            isAvailabilityIndicator: true
          }
        });
      });
    });

    return backgroundEvents;
  };

  // Combine regular events with background availability events
  const allEvents = [...events, ...generateAvailabilityBackgroundEvents()];

  // Function to check if a date is available for a specific resource
  const isDateAvailable = (date: Date, resourceId?: string): boolean => {
    if (!availableDates || availableDates.length === 0) {
      return true; // If no available dates specified, all dates are available
    }

    return availableDates.some((availableDate) => {
      const start = new Date(availableDate.start);
      const end = new Date(availableDate.end);

      // Check if the date falls within the range
      const dateInRange = isWithinInterval(date, { start, end }) || isSameDay(date, start) || isSameDay(date, end);

      // If resourceIds is specified, check if the current resource is included
      if (availableDate.resourceIds && resourceId) {
        return dateInRange && availableDate.resourceIds.includes(resourceId);
      }

      return dateInRange;
    });
  };

  interface SlotLabelArg {
    date: Date;
    resource?: { id: string };
    el: HTMLElement;
  }

  const handleSlotLabelDidMount = (arg: SlotLabelArg) => {
    const date = arg.date;
    const resourceId = arg.resource?.id;

    if (resourceId && date) {
      const isAvailable = isDateAvailable(date, resourceId);

      if (isAvailable) {
        arg.el.classList.add('fc-day-available');
      } else {
        arg.el.classList.add('fc-day-disabled');
      }
    }
  };

  // Filter date selection based on availability
  const handleSelectAllow = (selectInfo: { start: Date; end: Date; resource?: { id: string } }) => {
    const start = new Date(selectInfo.start);
    const end = new Date(selectInfo.end);
    const resourceId = selectInfo.resource?.id;

    return isDateAvailable(start, resourceId) && isDateAvailable(end, resourceId);
  };

  // Wrap the dateClick handler to check availability
  const handleDateClick = (info: DateClickArg) => {
    const resourceId = (info as unknown as { resource?: { id: string } }).resource?.id;

    if (isDateAvailable(info.date, resourceId) && dateClick) {
      dateClick(info);
    }
  };

  // Wrap the select handler to check availability
  const handleSelect = (selectInfo: DateSelectArg) => {
    const resourceId = (selectInfo as unknown as { resource?: { id: string } }).resource?.id;

    if (isDateAvailable(selectInfo.start, resourceId) && onDateSelect) {
      onDateSelect(selectInfo);
    }
  };

  // Handle event click - ignore background events
  const handleEventClick = (clickInfo: EventClickArg) => {
    // Skip if it's a background event
    if (clickInfo.event.extendedProps?.isAvailabilityIndicator) {
      return;
    }

    if (onEventClick) {
      onEventClick(clickInfo);
    }
  };

  const checkRestrictDragAndDropGroup = (targetResource: Resource, sourceResource: Resource) => {
    // Check if both resources have the same parent ID or group
    const targetParentId = targetResource._resource.parentId
      ? targetResource._resource.parentId
      : resourceGroupField
        ? targetResource._resource.extendedProps[resourceGroupField]
        : undefined;
    const sourceParentId = sourceResource._resource.parentId
      ? sourceResource._resource.parentId
      : resourceGroupField
        ? sourceResource._resource.extendedProps[resourceGroupField]
        : undefined;

    // Prevent dragging to parent resource
    if (!targetParentId) {
      return false;
    }

    // If both have parent IDs, check if they match
    if (targetParentId && sourceParentId) {
      const isSameParent = targetParentId === sourceParentId;

      // Return validation result without console logging
      return isSameParent;
    }

    if (!resourceGroupField) {
      return true;
    }

    // Fallback to group check (for top-level resources)
    const targetGroup = targetResource.extendedProps?.[resourceGroupField];
    const sourceGroup = sourceResource.extendedProps?.[resourceGroupField];

    if (targetGroup && sourceGroup) {
      return targetGroup === sourceGroup;
    }

    return false;
  };

  const checkRestrictDragAndDropResource = (targetResource: Resource, sourceResource: Resource) => {
    // It means cannot drag and drop to different resource, but may drag and drop to different date
    return targetResource.id === sourceResource.id;
  };

  const checkRestrictDragAndDropDate = (dropInfo: DateSpanApi, draggedEvent: EventApi) => {
    // It means cannot drag and drop to different date, but may drag and drop to different resource
    return dropInfo.startStr === draggedEvent.startStr;
  };

  const currentViewRangeRef = useRef<{ start: Date; end: Date } | null>(null);
  // Add a handler for date range changes
  const handleDatesSet = async (dateInfo: DatesSetArg) => {
    // Skip if we're already fetching or if the date range hasn't changed significantly
    const { start, end } = dateInfo;

    // Check if we already have this range loaded
    if (currentViewRangeRef.current) {
      const current = currentViewRangeRef.current;

      // If the new range is mostly within the current range, don't fetch
      const overlap =
        Math.min(current.end.getTime(), end.getTime()) - Math.max(current.start.getTime(), start.getTime());
      const totalRange = end.getTime() - start.getTime();

      if (overlap / totalRange > 0.7) {
        return; 
      }
    }

    currentViewRangeRef.current = { start, end };
    if (onDatesSet) {
      onDatesSet(dateInfo);
    }
  };

  useLayoutEffect(() => {
    startTransition(() => {
      setMounted(true);
    });
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className={cn('resource-calendar-container', className)}>
      <FullCalendar
        plugins={[resourceTimelinePlugin, interactionPlugin]}
        initialView={initialView}
        headerToolbar={headerToolbar}
        editable={editable}
        selectable={selectable}
        selectMirror={true}
        dayMaxEvents={true}
        events={allEvents}
        slotMinWidth={slotMinWidth}
        resources={resources}
        resourceGroupField={resourceGroupField}
        resourceLabelContent={resourceLabelContent}
        resourceLabelDidMount={resourceLabelDidMount}
        height={height}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        select={handleSelect}
        selectAllow={handleSelectAllow}
        datesSet={handleDatesSet}
        eventContent={eventContent}
        eventDurationEditable={false}
        eventChange={(arg: EventChangeArg) => {
          if (arg.event.extendedProps?.isAvailabilityIndicator) {
            return;
          }

          const resourceId = (arg.event as unknown as { getResources?: () => Array<{ id: string }> }).getResources?.()?.[0]?.id || '';
          const updatedEvent = {
            id: arg.event.id,
            title: arg.event.title,
            start: arg.event.start || new Date(),
            end: arg.event.end ?? undefined,
            resourceId,
            extendedProps: arg.event.extendedProps
          };
          onEventChange?.(updatedEvent);
        }}
        eventRemove={(arg: EventRemoveArg) => {
          if (arg.event.extendedProps?.isAvailabilityIndicator) {
            return;
          }

          onEventRemove?.(arg.event.id);
        }}
        eventAdd={(arg: EventAddArg) => {
          if (arg.event.extendedProps?.isAvailabilityIndicator) {
            return;
          }

          const resourceId = (arg.event as unknown as { getResources?: () => Array<{ id: string }> }).getResources?.()?.[0]?.id || '';
          const newEvent = {
            id: arg.event.id,
            title: arg.event.title,
            start: arg.event.start || new Date(),
            end: arg.event.end ?? undefined,
            resourceId,
            extendedProps: arg.event.extendedProps
          };
          onEventAdd?.(newEvent);
        }}
        eventAllow={(dropInfo: DateSpanApi, draggedEvent: EventApi | null): boolean => {
          const targetResource = (dropInfo as unknown as { resource?: Resource }).resource;

          if (!draggedEvent || !targetResource) {
            return false;
          }
          const sourceResource = (draggedEvent as unknown as { getResources?: () => Array<Resource> }).getResources?.()?.[0];

          if (!sourceResource) {
            return false;
          }

          if (!restrictDragAndDropType) {
            return true;
          }

          const draggedEventResources = (draggedEvent as unknown as { getResources?: () => Array<Resource> }).getResources?.() || [];
          if (!targetResource || !draggedEventResources.length) {
            return true;
          }

          if (!allowOverlapEvent) {
            const sourceResourceId = sourceResource.id;
            const targetResourceId = targetResource.id;
            const draggedEventId = draggedEvent.id;

            if (
              targetResourceId.includes('unallocated') &&
              sourceResourceId.replace('-unallocated', '') === targetResourceId.replace('-unallocated', '')
            ) {
              return true;
            }

            const allEvents = events;

            const newStart = format(dropInfo.start, 'yyyy-MM-dd') + ` ${format(events[0].start, 'HH:mm:ss')}`;
            const newEnd = dropInfo.end
              ? format(dropInfo.end, 'yyyy-MM-dd') +
                ` ${format(events[0].end ?? new Date('1970-01-01T00:00:00'), 'HH:mm:ss')}`
              : newStart;

            const hasOverlap = allEvents.some((event) => {
              const eventStart = event.start;
              const eventEnd = event.end || event.start;

              if (event.id === draggedEventId) {
                return false;
              }

              if (event.display === 'background') {
                return false;
              }

              if (event.resourceId !== targetResourceId) {
                return false;
              }

              const overlap =
                (newStart < eventEnd && newEnd > eventStart) ||
                (newStart >= eventStart && newEnd <= eventEnd) ||
                (newStart < eventStart && newEnd > eventStart && newEnd < eventEnd) ||
                (newStart > eventStart && newStart < eventEnd && newEnd > eventEnd);

              return overlap;
            });

            if (hasOverlap) {
              return false;
            }
          }

          if (restrictDragAndDropType === 'group') {
            return checkRestrictDragAndDropGroup(targetResource, sourceResource);
          }

          if (restrictDragAndDropType === 'resource') {
            return checkRestrictDragAndDropResource(targetResource, sourceResource);
          }

          if (restrictDragAndDropType === 'date') {
            return checkRestrictDragAndDropDate(dropInfo, draggedEvent);
          }

          if (restrictDragAndDropType === 'group-date') {
            return (
              checkRestrictDragAndDropGroup(targetResource, sourceResource) &&
              checkRestrictDragAndDropDate(dropInfo, draggedEvent)
            );
          }

          return true;
        }}
        eventClassNames={(arg: { event: EventApi }) => (arg.event.extendedProps?.isAvailabilityIndicator ? ['availability-background'] : [])}
        slotLabelFormat={{
          month: 'long',
          day: 'numeric',
          weekday: 'short'
        }}
        resourceAreaWidth={resourceAreaWidth}
        resourceAreaHeaderContent={resourceAreaHeaderContent}
        stickyHeaderDates={true}
        nowIndicator={true}
        customButtons={customButtons}
        views={{
          resourceTimelineMonth: {
            type: 'resourceTimeline',
            duration: {
              month: 2
            }
          }
        }}
        dateIncrement={{
          months: 1
        }}
        slotLabelDidMount={handleSlotLabelDidMount}
      />
    </div>
  );
}
