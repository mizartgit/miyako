type LayoutOptions = {
  preheader?: string;
  body: string;
};

export function emailLayout({ preheader, body }: LayoutOptions): string {
  const preheaderHtml = preheader
    ? `<span style="display:none;max-height:0;overflow:hidden;color:#0c0c0c;">${preheader}</span>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>MIYAKO</title>
</head>
<body style="margin:0;padding:0;background-color:#0c0c0c;font-family:Georgia,'Times New Roman',serif;">
  ${preheaderHtml}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0c0c0c;">
    <tr>
      <td align="center" style="padding:48px 24px 24px;">
        <p style="margin:0;font-size:18px;letter-spacing:0.35em;color:#c9a962;">MIYAKO</p>
        <p style="margin:8px 0 0;font-size:11px;letter-spacing:0.2em;color:#8a7344;font-family:Helvetica,Arial,sans-serif;text-transform:uppercase;">
          Curated Traditional Craft
        </p>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:0 24px 48px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#f5f2ec;">
          <tr>
            <td style="padding:40px 32px;color:#2a2826;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;">
              ${body}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:0 24px 48px;">
        <p style="margin:0;font-size:11px;letter-spacing:0.15em;color:#8a7344;font-family:Helvetica,Arial,sans-serif;">
          © ${new Date().getFullYear()} MIYAKO · A curated home for traditional craftsmanship
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function emailButton(href: string, label: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0;">
    <tr>
      <td style="background-color:#2a2826;">
        <a href="${href}" style="display:inline-block;padding:14px 28px;color:#f5f2ec;font-size:11px;letter-spacing:0.25em;text-decoration:none;text-transform:uppercase;font-family:Helvetica,Arial,sans-serif;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}

export function emailHeading(text: string): string {
  return `<h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:400;color:#2a2826;line-height:1.3;">${text}</h1>`;
}

export function emailDivider(): string {
  return `<hr style="margin:28px 0;border:none;border-top:1px solid rgba(42,40,38,0.12);" />`;
}
