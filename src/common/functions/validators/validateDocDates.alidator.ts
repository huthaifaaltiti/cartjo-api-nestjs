import { BadRequestException } from '@nestjs/common';
import { Locale } from '../../../types/Locale';
import { getMessage } from '../../utils/translator';

export function validateDocDates(
  start: Date | null,
  end: Date | null,
  lang: Locale,
  isUpdate: boolean = false,
) {
  const now = new Date();

  // 1. cannot set end without start
  if (!start && end) {
    throw new BadRequestException(
      getMessage('general_setStartDateBeforeEndDate', lang),
    );
  }

  // 2. no past dates (ONLY for create)
  if (!isUpdate) {
    if ((start && start < now) || (end && end < now)) {
      throw new BadRequestException(
        getMessage('general_mustBeFutureDates', lang),
      );
    }
  }

  // 3. end must be after start (always)
  if (start && end && end <= start) {
    throw new BadRequestException(
      getMessage('general_endDateMustBeAfterStartDates', lang),
    );
  }
}
