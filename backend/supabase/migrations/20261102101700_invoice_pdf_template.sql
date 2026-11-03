-- The invoice email now carries the PDF; only the untouched seeded wording is replaced (staff edits are kept).
update public.message_templates
set body = replace(body, 'We will send the PDF copy on request.', 'The PDF copy is attached.')
where key = 'invoice_issued' and channel = 'email' and body like '%We will send the PDF copy on request.%';
