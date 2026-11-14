"""Build the current report's HTML and PDF from PROJECT_REPORT.md.

Requires markdown-it-py and reportlab. No browser, login profile or network is used.
"""
from pathlib import Path
from html import escape
from urllib.parse import urljoin
import re
from markdown_it import MarkdownIt
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Preformatted, Table, TableStyle

DOCS = Path(__file__).resolve().parent
SOURCE = DOCS / 'PROJECT_REPORT.md'
HTML = DOCS / 'PROJECT_REPORT.html'
PDF = DOCS / 'AutoCare_Insight_Project_Report.pdf'
BASE_URL = 'https://github.com/ignite-2005/AutoCare-Insight/blob/master/docs/'
md = MarkdownIt('commonmark').enable('table')
text = SOURCE.read_text(encoding='utf-8-sig')

css = '''
:root { color-scheme: light; }
body { max-width: 960px; margin: 40px auto; padding: 0 24px; color: #243345;
       font: 16px/1.65 system-ui, sans-serif; }
h1,h2,h3 { color: #173f67; line-height: 1.25; break-after: avoid; }
h1 { border-bottom: 3px solid #3274ae; padding-bottom: 16px; }
h2 { margin-top: 36px; font-size: 24px; }
a { color: #245c90; overflow-wrap: anywhere; }
table { width: 100%; border-collapse: collapse; font-size: 14px; margin: 20px 0; }
th,td { padding: 10px 12px; border: 1px solid #d6dee7; text-align: left; vertical-align: top; }
th { background: #eaf0f6; }
tr:nth-child(even) { background: #f6f8fb; }
pre { padding: 18px; border: 1px solid #d6dee7; background: #f4f7fa;
      white-space: pre-wrap; overflow-wrap: anywhere; }
code { font: 0.9em/1.5 Consolas, monospace; }
@media print { body { margin: 0; max-width: none; font-size: 10pt; }
  @page { size: A4; margin: 18mm; }
  h2 { margin-top: 20pt; font-size: 14pt; }
  table { font-size: 8.5pt; } tr { break-inside: avoid; }
}
'''
HTML.write_text('<!doctype html>\n<html lang="en"><head><meta charset="utf-8">'
                '<meta name="viewport" content="width=device-width,initial-scale=1">'
                '<title>AutoCare Insight - Project Report</title><style>' + css +
                '</style></head><body>' + md.render(text) + '</body></html>\n', encoding='utf-8')

font_dir = Path('C:/Windows/Fonts')
if (font_dir / 'segoeui.ttf').exists():
    for name, file in [('Report','segoeui.ttf'),('Report-Bold','segoeuib.ttf'),('Report-Italic','segoeuii.ttf')]:
        pdfmetrics.registerFont(TTFont(name, str(font_dir / file)))
    pdfmetrics.registerFontFamily('Report',normal='Report',bold='Report-Bold',italic='Report-Italic',boldItalic='Report-Bold')
    normal,bold='Report','Report-Bold'
else:
    normal,bold='Helvetica','Helvetica-Bold'

styles = getSampleStyleSheet()
body = ParagraphStyle('ReportBody',fontName=normal,fontSize=9.5,leading=14,textColor=colors.HexColor('#243345'),spaceAfter=8)
heading1 = ParagraphStyle('ReportH1',parent=body,fontName=bold,fontSize=20,leading=25,textColor=colors.HexColor('#173f67'),spaceAfter=16,keepWithNext=True)
heading2 = ParagraphStyle('ReportH2',parent=body,fontName=bold,fontSize=13,leading=18,textColor=colors.HexColor('#173f67'),spaceBefore=13,spaceAfter=8,keepWithNext=True)
heading3 = ParagraphStyle('ReportH3',parent=heading2,fontSize=11,leading=15)
cell_style = ParagraphStyle('ReportCell',parent=body,fontSize=8.4,leading=12,spaceAfter=0)
bullet_style = ParagraphStyle('ReportBullet',parent=body,leftIndent=12,firstLineIndent=0,bulletIndent=0,spaceAfter=6)
code_style = ParagraphStyle('ReportCode',fontName='Courier',fontSize=8,leading=11,spaceBefore=5,spaceAfter=10,borderPadding=8,backColor=colors.HexColor('#f4f7fa'))

def inline(value):
    rendered = md.renderInline(value)
    rendered = rendered.replace('<strong>','<b>').replace('</strong>','</b>').replace('<em>','<i>').replace('</em>','</i>')
    rendered = rendered.replace('<code>','<font name="Courier" color="#245c90">').replace('</code>','</font>')
    rendered = rendered.replace('<br />','<br/>')
    return re.sub(r'<a href="([^"]+)"',lambda m: '<a href="' + escape(urljoin(BASE_URL,m.group(1)),quote=True) + '" color="#245c90"',rendered)

tokens = md.parse(text)
story=[]
i=0
in_list=0
while i < len(tokens):
    token=tokens[i]
    if token.type == 'heading_open':
        style = heading1 if token.tag=='h1' else heading2 if token.tag=='h2' else heading3
        story.append(Paragraph(inline(tokens[i+1].content),style)); i+=3; continue
    if token.type == 'paragraph_open':
        story.append(Paragraph(inline(tokens[i+1].content),bullet_style if in_list else body,bulletText='-' if in_list else None)); i+=3; continue
    if token.type in ('bullet_list_open','ordered_list_open'): in_list+=1
    elif token.type in ('bullet_list_close','ordered_list_close'): in_list-=1
    elif token.type == 'fence': story.append(Preformatted(token.content.rstrip(),code_style,maxLineLength=98))
    elif token.type == 'table_open':
        rows=[]; row=[]; i+=1
        while tokens[i].type != 'table_close':
            item=tokens[i]
            if item.type=='tr_open': row=[]
            elif item.type=='inline': row.append(Paragraph(inline(item.content),cell_style))
            elif item.type=='tr_close': rows.append(row)
            i+=1
        width=A4[0]-88
        widths=[width*0.29,width*0.71] if len(rows[0])==2 else [width/len(rows[0])]*len(rows[0])
        table=Table(rows,colWidths=widths,repeatRows=1,hAlign='LEFT')
        table.setStyle(TableStyle([
            ('VALIGN',(0,0),(-1,-1),'TOP'),('GRID',(0,0),(-1,-1),0.45,colors.HexColor('#d6dee7')),
            ('BACKGROUND',(0,0),(-1,0),colors.HexColor('#eaf0f6')),
            ('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#f6f8fb')]),
            ('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),
            ('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7),
        ]))
        story.extend([Spacer(1,4),table,Spacer(1,10)])
    i+=1

def page_decoration(canvas,doc):
    canvas.saveState(); canvas.setFont(normal,8); canvas.setFillColor(colors.HexColor('#66788c'))
    canvas.drawString(44,A4[1]-28,'AutoCare Insight | DBMS Level 3 | 14 November 2026')
    canvas.drawRightString(A4[0]-44,25,f'Page {doc.page}')
    canvas.setStrokeColor(colors.HexColor('#d6dee7')); canvas.line(44,40,A4[0]-44,40)
    canvas.restoreState()

doc=SimpleDocTemplate(str(PDF),pagesize=A4,rightMargin=44,leftMargin=44,topMargin=52,bottomMargin=52,
    title='AutoCare Insight - Project Report',author='AutoCare Insight',subject='Current architecture and verified cloud release')
doc.build(story,onFirstPage=page_decoration,onLaterPages=page_decoration)
print(f'Report HTML and PDF generated from {SOURCE.name}.')
