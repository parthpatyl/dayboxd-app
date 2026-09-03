import { DayLog } from '../types';
import { formatDateFull, getDayOfWeekTemplateId, renderStarLabel } from './format';
import { getDayTemplateSvgString } from '../components/posters/DayTemplates';

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  ctx.save();
  drawRoundedRect(ctx, x, y, w, h, radius);
  ctx.clip();

  const imgRatio = img.width / img.height;
  const targetRatio = w / h;
  let renderW = w;
  let renderH = h;
  let offsetX = 0;
  let offsetY = 0;

  if (imgRatio > targetRatio) {
    renderW = h * imgRatio;
    offsetX = (w - renderW) / 2;
  } else {
    renderH = w / imgRatio;
    offsetY = (h - renderH) / 2;
  }

  ctx.drawImage(img, x + offsetX, y + offsetY, renderW, renderH);
  ctx.restore();

  ctx.save();
  drawRoundedRect(ctx, x, y, w, h, radius);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = ctx.measureText(testLine).width;
    if (width < maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

async function renderTicketCard(
  canvas: HTMLCanvasElement,
  day: Partial<DayLog>,
  profileName: string,
  posterDataUri?: string | null
) {
  const width = 680;
  const cardX = 20;
  const cardY = 20;
  const cardW = width - 40;
  const cardRadius = 24;
  const padX = 32;

  // Setup context for measurement
  canvas.width = width;
  canvas.height = 1200;
  let ctx = canvas.getContext('2d')!;

  const headerLineY = cardY + 76;
  const posterX = cardX + padX;
  const posterY = headerLineY + 22;
  const posterW = 160;
  const posterH = 210;

  // Measure title
  const textX = posterX + posterW + 24;
  const maxTitleW = cardW - (posterW + padX * 2 + 24);
  ctx.font = 'bold 26px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const titleLines = wrapText(ctx, day.title || 'Untitled Feature', maxTitleW).slice(0, 2);

  let textBlockH = titleLines.length * 32 + 26;
  if (day.rating && day.rating > 0) {
    textBlockH += 38;
  }
  const mainRowH = Math.max(posterH, textBlockH);
  const rowBottomY = posterY + mainRowH;

  // Measure quote box if present
  let quoteLines: string[] = [];
  const quoteBoxX = cardX + padX;
  let quoteBoxY = 0;
  let quoteBoxH = 0;
  const quoteBoxW = cardW - padX * 2;
  let afterContentY = rowBottomY;

  if (day.dialogueQuote) {
    ctx.font = 'italic 19px Georgia, "Times New Roman", serif';
    quoteLines = wrapText(ctx, day.dialogueQuote, quoteBoxW - 48).slice(0, 3);
    quoteBoxH = Math.max(54, 26 + quoteLines.length * 26);
    quoteBoxY = rowBottomY + 18;
    afterContentY = quoteBoxY + quoteBoxH;
  }

  // Footer sits tightly 20px below the content
  const footerDividerY = afterContentY + 20;
  const footerTextY = footerDividerY + 28;
  const cardBottom = footerTextY + 20;
  const cardH = cardBottom - cardY;
  const height = cardH + 40;

  // Resize canvas to exact calculated height
  canvas.width = width;
  canvas.height = height;

  ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Ticket Card Background & Dashed Amber Border
  ctx.save();
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
  ctx.fillStyle = '#1c222b';
  ctx.fill();

  ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([10, 6]);
  ctx.stroke();
  ctx.restore();

  // 2. Perforated Edge Notches (placed at vertical center of card)
  const notchY = cardY + cardH / 2;
  const notchRadius = 22;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cardX, notchY, notchRadius, -Math.PI / 2, Math.PI / 2, false);
  ctx.fillStyle = '#0d1014';
  ctx.fill();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cardX + cardW, notchY, notchRadius, Math.PI / 2, (3 * Math.PI) / 2, false);
  ctx.fillStyle = '#0d1014';
  ctx.fill();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();

  // 3. Header Text
  ctx.save();
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 15px "Courier New", Courier, monospace';
  ctx.fillText('ADMIT ONE • LIFE ARCHIVE', cardX + padX, cardY + 36);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 22px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('DAYBOXD', cardX + padX, cardY + 62);

  ctx.fillStyle = '#9ca3af';
  ctx.font = '15px "Courier New", Courier, monospace';
  ctx.textAlign = 'right';
  const dayNum = (day.id || '20260901').replace(/-/g, '');
  ctx.fillText(`№ ${dayNum}`, cardX + cardW - padX, cardY + 52);
  ctx.restore();

  // Header Divider
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(cardX + padX, headerLineY);
  ctx.lineTo(cardX + cardW - padX, headerLineY);
  ctx.stroke();
  ctx.restore();

  // 4. Poster Artwork
  let posterImg: HTMLImageElement | null = null;
  try {
    if (posterDataUri) {
      posterImg = await loadImage(posterDataUri);
    } else {
      const templateId = day.posterTemplateId || (day.id ? getDayOfWeekTemplateId(day.id) : 'mon');
      const svgStr = getDayTemplateSvgString(templateId, day.title, day.id);
      const svgDataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`;
      posterImg = await loadImage(svgDataUri);
    }
  } catch (err) {
    console.warn('Could not load poster image for canvas, using fallback box:', err);
  }

  if (posterImg) {
    drawImageCover(ctx, posterImg, posterX, posterY, posterW, posterH, 14);
  } else {
    drawRoundedRect(ctx, posterX, posterY, posterW, posterH, 14);
    ctx.fillStyle = '#14181c';
    ctx.fill();
  }

  // 5. Title, Date, Stars on Right
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  let titleY = posterY + 34;
  titleLines.forEach((line) => {
    ctx.fillText(line, textX, titleY);
    titleY += 32;
  });

  ctx.fillStyle = '#9ca3af';
  ctx.font = '17px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(formatDateFull(day.id || ''), textX, titleY + 6);

  if (day.rating && day.rating > 0) {
    const starStr = renderStarLabel(day.rating);
    ctx.fillStyle = '#00e054';
    ctx.font = 'bold 24px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(starStr, textX, titleY + 46);

    if (day.isLiked) {
      const starWidth = ctx.measureText(starStr).width;
      ctx.fillStyle = '#ff4d6d';
      ctx.font = 'bold 22px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(' ♥', textX + starWidth, titleY + 45);
    }
  }
  ctx.restore();

  // 6. Quote Box (rendered only if present, sized to text)
  if (day.dialogueQuote && quoteLines.length > 0) {
    ctx.save();
    drawRoundedRect(ctx, quoteBoxX, quoteBoxY, quoteBoxW, quoteBoxH, 14);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#e5e7eb';
    ctx.font = 'italic 19px Georgia, "Times New Roman", serif';
    ctx.textAlign = 'center';
    const startQuoteY = quoteBoxY + (quoteBoxH - quoteLines.length * 26) / 2 + 18;
    quoteLines.forEach((qLine, i) => {
      ctx.fillText(qLine, quoteBoxX + quoteBoxW / 2, startQuoteY + i * 26);
    });
    ctx.restore();
  }

  // 7. Footer (immediately follows content with no empty gap)
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(cardX + padX, footerDividerY);
  ctx.lineTo(cardX + cardW - padX, footerDividerY);
  ctx.stroke();

  ctx.fillStyle = '#9ca3af';
  ctx.font = 'bold 15px "Courier New", Courier, monospace';
  ctx.fillText(`LOC: ${(day.location || 'WORLD').toUpperCase()}`, cardX + padX, footerTextY);

  ctx.textAlign = 'right';
  ctx.fillText(`DIRECTOR: ${(profileName || 'YOU').toUpperCase()}`, cardX + cardW - padX, footerTextY);
  ctx.restore();
}

async function renderPosterCard(
  canvas: HTMLCanvasElement,
  day: Partial<DayLog>,
  profileName: string,
  posterDataUri?: string | null
) {
  const width = 680;
  const cardX = 20;
  const cardY = 20;
  const cardW = width - 40;
  const cardRadius = 24;
  const padX = 28;

  // Setup context for measurement
  canvas.width = width;
  canvas.height = 1600;
  let ctx = canvas.getContext('2d')!;

  const posterY = cardY + 54;
  const posterW = cardW - padX * 2;
  const posterH = 540;

  // Measure title
  ctx.font = '900 30px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const titleLines = wrapText(ctx, day.title || 'Untitled Day', cardW - padX * 2 - 20).slice(0, 2);

  // Measure quote if present
  let quoteLines: string[] = [];
  if (day.dialogueQuote) {
    ctx.font = 'italic 19px Georgia, "Times New Roman", serif';
    quoteLines = wrapText(ctx, day.dialogueQuote, cardW - padX * 2 - 40).slice(0, 3);
  }

  // Calculate dynamic content height
  let textFlowY = posterY + posterH + 30;
  textFlowY += titleLines.length * 36; // Title
  textFlowY += 26; // Date

  if (day.rating && day.rating > 0) {
    textFlowY += 38; // Stars
  }

  if (quoteLines.length > 0) {
    textFlowY += 16 + quoteLines.length * 26; // Quote
  }

  // Footer sits tightly 24px below the content
  const footerDividerY = textFlowY + 24;
  const footerTextY = footerDividerY + 28;
  const cardBottom = footerTextY + 22;
  const cardH = cardBottom - cardY;
  const height = cardH + 40;

  // Resize canvas to exact calculated height
  canvas.width = width;
  canvas.height = height;

  ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Poster Card Background & Border
  ctx.save();
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
  ctx.fillStyle = '#14181c';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // 2. Header: "A DAYBOXD ORIGINAL FEATURE"
  ctx.save();
  ctx.fillStyle = '#00e054';
  ctx.font = 'bold 15px "Courier New", Courier, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('A DAYBOXD ORIGINAL FEATURE', width / 2, cardY + 36);
  ctx.restore();

  // 3. Poster Artwork
  const posterX = cardX + padX;
  let posterImg: HTMLImageElement | null = null;
  try {
    if (posterDataUri) {
      posterImg = await loadImage(posterDataUri);
    } else {
      const templateId = day.posterTemplateId || (day.id ? getDayOfWeekTemplateId(day.id) : 'mon');
      const svgStr = getDayTemplateSvgString(templateId, day.title, day.id);
      const svgDataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`;
      posterImg = await loadImage(svgDataUri);
    }
  } catch (err) {
    console.warn('Could not load poster image for canvas:', err);
  }

  if (posterImg) {
    drawImageCover(ctx, posterImg, posterX, posterY, posterW, posterH, 18);
  } else {
    drawRoundedRect(ctx, posterX, posterY, posterW, posterH, 18);
    ctx.fillStyle = '#0c0d10';
    ctx.fill();
  }

  // 4. Title, Date, Stars, Quote
  let curY = posterY + posterH + 34;
  ctx.save();
  ctx.textAlign = 'center';

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 30px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  titleLines.forEach((line) => {
    ctx.fillText(line, width / 2, curY);
    curY += 34;
  });

  // Date
  curY += 4;
  ctx.fillStyle = '#9ca3af';
  ctx.font = '16px "Courier New", Courier, monospace';
  ctx.fillText(formatDateFull(day.id || ''), width / 2, curY);

  // Rating & Heart
  if (day.rating && day.rating > 0) {
    curY += 38;
    const starStr = renderStarLabel(day.rating);
    ctx.fillStyle = '#00e054';
    ctx.font = 'bold 26px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    
    if (day.isLiked) {
      ctx.fillText(`${starStr}  ♥`, width / 2, curY);
    } else {
      ctx.fillText(starStr, width / 2, curY);
    }
  }

  // Quote
  if (quoteLines.length > 0) {
    curY += 30;
    ctx.fillStyle = '#d1d5db';
    ctx.font = 'italic 19px Georgia, "Times New Roman", serif';
    quoteLines.forEach((line) => {
      ctx.fillText(line, width / 2, curY);
      curY += 26;
    });
  }
  ctx.restore();

  // 5. Footer (immediately follows content with no empty gap)
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cardX + padX, footerDividerY);
  ctx.lineTo(cardX + cardW - padX, footerDividerY);
  ctx.stroke();

  ctx.fillStyle = '#9ca3af';
  ctx.font = 'bold 14px "Courier New", Courier, monospace';
  ctx.fillText(`GENRE: ${(day.genres?.[0] || 'DRAMA').toUpperCase()}`, cardX + padX, footerTextY);

  ctx.textAlign = 'right';
  ctx.fillText(`STARRING: ${(profileName || 'SELF').toUpperCase()}`, cardX + cardW - padX, footerTextY);
  ctx.restore();
}

export async function generateCardPngDataUrl(
  day: Partial<DayLog>,
  profileName: string,
  styleMode: 'ticket' | 'poster',
  customPosterDataUri?: string | null
): Promise<string> {
  const canvas = document.createElement('canvas');
  if (styleMode === 'ticket') {
    await renderTicketCard(canvas, day, profileName, customPosterDataUri);
  } else {
    await renderPosterCard(canvas, day, profileName, customPosterDataUri);
  }
  return canvas.toDataURL('image/png');
}
