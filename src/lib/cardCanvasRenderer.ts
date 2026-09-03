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
  const height = 860;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const cardX = 20;
  const cardY = 20;
  const cardW = width - 40;
  const cardH = height - 40;
  const cardRadius = 28;

  ctx.save();
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
  ctx.fillStyle = '#1c222b';
  ctx.fill();

  ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([10, 6]);
  ctx.stroke();
  ctx.restore();

  const notchY = cardY + cardH / 2;
  const notchRadius = 24;

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

  ctx.save();
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 16px "Courier New", Courier, monospace';
  ctx.fillText('ADMIT ONE • LIFE ARCHIVE', cardX + 32, cardY + 46);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 22px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('DAYBOXD', cardX + 32, cardY + 76);

  ctx.fillStyle = '#9ca3af';
  ctx.font = '16px "Courier New", Courier, monospace';
  ctx.textAlign = 'right';
  const dayNum = (day.id || '20260901').replace(/-/g, '');
  ctx.fillText(`№ ${dayNum}`, cardX + cardW - 32, cardY + 60);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(cardX + 32, cardY + 98);
  ctx.lineTo(cardX + cardW - 32, cardY + 98);
  ctx.stroke();
  ctx.restore();

  const posterX = cardX + 32;
  const posterY = cardY + 120;
  const posterW = 160;
  const posterH = 240;

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

  const textX = posterX + posterW + 28;
  const maxTitleW = cardW - (posterW + 92);

  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const titleLines = wrapText(ctx, day.title || 'Untitled Feature', maxTitleW).slice(0, 2);
  let titleY = posterY + 36;
  titleLines.forEach((line) => {
    ctx.fillText(line, textX, titleY);
    titleY += 32;
  });

  ctx.fillStyle = '#9ca3af';
  ctx.font = '18px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
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

  if (day.dialogueQuote) {
    const quoteBoxX = cardX + 32;
    const quoteBoxY = posterY + posterH + 32;
    const quoteBoxW = cardW - 64;
    const quoteBoxH = 150;

    ctx.save();
    drawRoundedRect(ctx, quoteBoxX, quoteBoxY, quoteBoxW, quoteBoxH, 18);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#e5e7eb';
    ctx.font = 'italic 20px Georgia, "Times New Roman", serif';
    ctx.textAlign = 'center';
    const quoteLines = wrapText(ctx, day.dialogueQuote, quoteBoxW - 48).slice(0, 3);
    const startQuoteY = quoteBoxY + (quoteBoxH - quoteLines.length * 28) / 2 + 20;
    quoteLines.forEach((qLine, i) => {
      ctx.fillText(qLine, quoteBoxX + quoteBoxW / 2, startQuoteY + i * 28);
    });
    ctx.restore();
  }

  const footerY = cardY + cardH - 76;
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(cardX + 32, footerY);
  ctx.lineTo(cardX + cardW - 32, footerY);
  ctx.stroke();

  ctx.fillStyle = '#9ca3af';
  ctx.font = 'bold 16px "Courier New", Courier, monospace';
  ctx.fillText(`LOC: ${(day.location || 'WORLD').toUpperCase()}`, cardX + 32, footerY + 38);

  ctx.textAlign = 'right';
  ctx.fillText(`DIRECTOR: ${(profileName || 'YOU').toUpperCase()}`, cardX + cardW - 32, footerY + 38);
  ctx.restore();
}

async function renderPosterCard(
  canvas: HTMLCanvasElement,
  day: Partial<DayLog>,
  profileName: string,
  posterDataUri?: string | null
) {
  const width = 680;
  const height = 1060;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const cardX = 20;
  const cardY = 20;
  const cardW = width - 40;
  const cardH = height - 40;
  const cardRadius = 28;

  ctx.save();
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
  ctx.fillStyle = '#14181c';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = '#00e054';
  ctx.font = 'bold 16px "Courier New", Courier, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('A DAYBOXD ORIGINAL FEATURE', width / 2, cardY + 44);
  ctx.restore();

  const posterW = cardW - 64;
  const posterH = 540;
  const posterX = cardX + 32;
  const posterY = cardY + 70;

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
    drawImageCover(ctx, posterImg, posterX, posterY, posterW, posterH, 20);
  } else {
    drawRoundedRect(ctx, posterX, posterY, posterW, posterH, 20);
    ctx.fillStyle = '#0c0d10';
    ctx.fill();
  }

  let curY = posterY + posterH + 46;
  ctx.save();
  ctx.textAlign = 'center';

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 32px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const titleLines = wrapText(ctx, day.title || 'Untitled Day', cardW - 64).slice(0, 1);
  ctx.fillText(titleLines[0] || 'Untitled Day', width / 2, curY);

  curY += 34;
  ctx.fillStyle = '#9ca3af';
  ctx.font = '18px "Courier New", Courier, monospace';
  ctx.fillText(formatDateFull(day.id || ''), width / 2, curY);

  if (day.rating && day.rating > 0) {
    curY += 40;
    const starStr = renderStarLabel(day.rating);
    ctx.fillStyle = '#00e054';
    ctx.font = 'bold 28px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    
    if (day.isLiked) {
      const totalText = `${starStr}  ♥`;
      ctx.fillText(totalText, width / 2, curY);
    } else {
      ctx.fillText(starStr, width / 2, curY);
    }
  }

  if (day.dialogueQuote) {
    curY += 38;
    ctx.fillStyle = '#d1d5db';
    ctx.font = 'italic 19px Georgia, "Times New Roman", serif';
    const quoteLines = wrapText(ctx, day.dialogueQuote, cardW - 80).slice(0, 2);
    quoteLines.forEach((line) => {
      ctx.fillText(line, width / 2, curY);
      curY += 26;
    });
  }
  ctx.restore();

  const footerY = cardY + cardH - 64;
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cardX + 32, footerY);
  ctx.lineTo(cardX + cardW - 32, footerY);
  ctx.stroke();

  ctx.fillStyle = '#9ca3af';
  ctx.font = 'bold 15px "Courier New", Courier, monospace';
  ctx.fillText(`GENRE: ${(day.genres?.[0] || 'DRAMA').toUpperCase()}`, cardX + 32, footerY + 34);

  ctx.textAlign = 'right';
  ctx.fillText(`STARRING: ${(profileName || 'SELF').toUpperCase()}`, cardX + cardW - 32, footerY + 34);
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
