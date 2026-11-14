# Vehicle intake photos

## Using the feature

1. Open Appointments and choose Book Appointment.
2. Complete the existing booking fields. In Vehicle condition photos, select photos or use the camera input on a supported phone.
3. Preview the photos and remove any incorrect selections before saving. Optionally add a note describing visible marks or damage.
4. Confirm Booking. The booking is saved first and its photos are then uploaded. If uploading fails, the form states that the appointment already exists and lets you retry photos without creating a second booking. Closing that form does not undo the booking; use its Intake photos button to add photos later.
5. Every appointment row has an Intake photos button to view the retained originals. Open an image to inspect it at full size. Staff ID, upload time and SHA-256 checksum are available in the gallery.
6. Admins and service advisors can add photos while the appointment is pending/confirmed and no workshop job exists. Once work starts, or an appointment is completed/cancelled, uploads are blocked; saved images remain readable. There are no image edit/replace/delete API routes.

Photos are optional: appointments without photos retain their existing workflow. Photograph all sides and any pre-existing scratches/dents before dispatching the job. Record intake at the actual vehicle handover, rather than treating an advance booking date as proof of inspection.

## Limits and storage

- Up to 6 distinct images per appointment.
- JPEG, PNG and WebP; non-animated, up to 3 MB each, 12 MB per selection, 20 million decoded pixels per image. The website sends one image per request so a full selection also works within serverless hosting payload limits.
- The server validates MIME/extension and decodes the actual pixels with Sharp. Disguised HTML/SVG, corrupt, truncated or oversized images are rejected.
- Original bytes are stored in the additive MySQL appointment_intake_photos table, with appointment/staff foreign keys, server upload time, a note and SHA-256 checksum. This keeps the image and metadata in the same database transaction. Include this table in normal database backups.
- Existing appointments and records are not rewritten by the migration. New installs run it through setup:db; existing installs can run npm run db:intake-photos.
- Images are streamed only through authenticated endpoints, with private/no-store and nosniff headers. They are not placed in public/ and filenames never determine storage paths.
- Repeated identical uploads are deduplicated by appointment/checksum. Each request is transactional. If a later image fails, earlier images remain saved; the form keeps its selection and explains that retrying safely skips duplicates.
- Uploads lock the appointment row and recheck its state/job link before saving. Stored procedure booking calls now read OUT variables on the same connection so concurrent pool traffic cannot mix booking results.

## Boundaries

The upload time records when the server received the file, not when the camera took it. A checksum helps identify changed bytes; it does not independently certify the scene, capture date, or legal liability. Database administrators can still modify database records. Original files may include camera metadata; treat them as private customer records and back them up accordingly.

## Verification commands

```powershell
npm run test:intake
npm run test:intake:integration
npm test
npm run test:smoke
npm run typecheck
npm run lint
npm run build
```

The integration suite requires the app running and uses its own temporary customer/vehicle/booking. It checks uploads, image retrieval, duplicate retries, permissions, read-only behavior after job dispatch and cleanup. It compares all pre-existing table contents afterwards. It does not use or delete real customer photos. Use SMOKE_BASE_URL to target a non-default local port.

### Latest verification

41 automated tests, 55 feature integration checks (development and production), and 83 existing app smoke checks passed. The real browser booking/gallery flow was checked, including an intentionally failed upload and retry without duplicate booking. Existing database records were unchanged after temporary fixtures were removed. Production build and TypeScript passed; existing React effect dependency warnings remain. Phone camera hardware was not part of the local test.
