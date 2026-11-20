import zlib
import re

class PDFDoc:
    def __init__(self):
        self.objects = []
        self.pages = []
        self.fonts = {
            "F1": "Helvetica",
            "F2": "Helvetica-Bold",
            "F3": "Helvetica-Oblique",
            "F4": "Courier",
            "F5": "Courier-Bold",
            "F6": "Times-Roman",
            "F7": "Times-Bold",
            "F8": "Times-Italic"
        }
        
    def add_object(self, obj_str):
        self.objects.append(obj_str.encode('latin1') if isinstance(obj_str, str) else obj_str)
        return len(self.objects)

    def write_pdf(self, filename):
        # Object 1: Catalog
        # Object 2: Pages tree
        # Object 3..10: Fonts
        # Page objects and Stream objects follow
        
        num_fonts = len(self.fonts)
        font_obj_map = {}
        for i, (fname, base_font) in enumerate(self.fonts.items(), start=3):
            font_obj_map[fname] = i

        total_pages = len(self.pages)
        page_obj_start = 3 + num_fonts
        # Page i: obj page_obj_start + 2*i
        # Stream i: obj page_obj_start + 2*i + 1
        
        # Prepare objects list
        all_objs = [None] * (page_obj_start + 2 * total_pages)
        
        # Catalog
        all_objs[1] = b"<< /Type /Catalog /Pages 2 0 R >>"
        
        # Pages tree
        kids_refs = " ".join([f"{page_obj_start + 2*i} 0 R" for i in range(total_pages)])
        all_objs[2] = f"<< /Type /Pages /Kids [{kids_refs}] /Count {total_pages} >>".encode('latin1')
        
        # Fonts
        for fname, obj_id in font_obj_map.items():
            base_font = self.fonts[fname]
            all_objs[obj_id] = f"<< /Type /Font /Subtype /Type1 /BaseFont /{base_font} /Encoding /WinAnsiEncoding >>".encode('latin1')
            
        font_res_str = " ".join([f"/{fname} {obj_id} 0 R" for fname, obj_id in font_obj_map.items()])
        
        for i, content_stream in enumerate(self.pages):
            p_obj_id = page_obj_start + 2*i
            s_obj_id = p_obj_id + 1
            
            # Compressed stream
            comp = zlib.compress(content_stream.encode('latin1') if isinstance(content_stream, str) else content_stream)
            all_objs[s_obj_id] = f"<< /Length {len(comp)} /Filter /FlateDecode >>\nstream\n".encode('latin1') + comp + b"\nendstream"
            
            # Page obj
            all_objs[p_obj_id] = (
                f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] "
                f"/Contents {s_obj_id} 0 R "
                f"/Resources << /Font << {font_res_str} >> /ProcSet [/PDF /Text /ImageC] >> >>"
            ).encode('latin1')

        with open(filename, 'wb') as f:
            f.write(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
            xref_offsets = [0]
            
            for obj_idx in range(1, len(all_objs)):
                offset = f.tell()
                xref_offsets.append(offset)
                data = all_objs[obj_idx]
                f.write(f"{obj_idx} 0 obj\n".encode('latin1'))
                f.write(data)
                f.write(b"\nendobj\n")
                
            xref_pos = f.tell()
            f.write(f"xref\n0 {len(all_objs)}\n".encode('latin1'))
            f.write(b"0000000000 65535 f \n")
            for offset in xref_offsets[1:]:
                f.write(f"{offset:010d} 00000 n \n".encode('latin1'))
                
            f.write(f"trailer\n<< /Size {len(all_objs)} /Root 1 0 R >>\nstartxref\n{xref_pos}\n%%EOF\n".encode('latin1'))

class PageBuilder:
    def __init__(self, page_num, total_pages=20):
        self.page_num = page_num
        self.total_pages = total_pages
        self.commands = []
        self.width = 595.28
        self.height = 841.89
        self.margin_left = 50.0
        self.margin_right = 50.0
        self.content_width = self.width - self.margin_left - self.margin_right
        self.y = 780.0
        
        if page_num > 1:
            self._add_running_header_footer()
            self.y = 750.0

    def _add_running_header_footer(self):
        # Header text and line
        c = self.commands
        c.append("q")
        c.append("0.4 0.4 0.45 RG")
        c.append("0.5 w")
        c.append(f"{self.margin_left} 800 m {self.width - self.margin_right} 800 l S")
        c.append("BT")
        c.append("/F3 8.5 Tf")
        c.append("0.3 0.3 0.35 rg")
        c.append(f"{self.margin_left} 805 Td")
        c.append("(HealthVault DW: Healthcare Data Warehouse & Analytics Platform) Tj")
        c.append("ET")
        c.append("BT")
        c.append("/F2 8.5 Tf")
        c.append(f"{self.width - self.margin_right - 145} 805 Td")
        c.append("(JIIT Noida | Dept. of CSE) Tj")
        c.append("ET")
        c.append("Q")

        # Footer text and line
        c.append("q")
        c.append("0.7 0.7 0.75 RG")
        c.append("0.5 w")
        c.append(f"{self.margin_left} 45 m {self.width - self.margin_right} 45 l S")
        c.append("BT")
        c.append("/F1 8.5 Tf")
        c.append("0.4 0.4 0.4 rg")
        c.append(f"{self.margin_left} 32 Td")
        c.append("(Data Mining & Data Warehousing Capstone Project Report) Tj")
        c.append("ET")
        c.append("BT")
        c.append("/F2 8.5 Tf")
        page_str = f"Page {self.page_num} of {self.total_pages}"
        c.append(f"{self.width - self.margin_right - 65} 32 Td")
        c.append(f"({page_str}) Tj")
        c.append("ET")
        c.append("Q")

    def escape(self, s):
        return s.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')

    def text(self, x, y, string, font="F1", size=10, r=0.1, g=0.1, b=0.1, align="left"):
        clean_str = self.escape(string)
        # Approximate width for centering
        char_w = size * 0.52
        if "Bold" in font: char_w = size * 0.58
        if "Courier" in font: char_w = size * 0.60
        text_w = len(string) * char_w
        
        pos_x = x
        if align == "center":
            pos_x = x - (text_w / 2.0)
        elif align == "right":
            pos_x = x - text_w
            
        self.commands.append("BT")
        self.commands.append(f"/{font} {size} Tf")
        self.commands.append(f"{r:.3f} {g:.3f} {b:.3f} rg")
        self.commands.append(f"{pos_x:.2f} {y:.2f} Td")
        self.commands.append(f"({clean_str}) Tj")
        self.commands.append("ET")

    def draw_line(self, x1, y1, x2, y2, width=1.0, r=0.2, g=0.2, b=0.2):
        self.commands.append("q")
        self.commands.append(f"{r:.3f} {g:.3f} {b:.3f} RG")
        self.commands.append(f"{width:.2f} w")
        self.commands.append(f"{x1:.2f} {y1:.2f} m {x2:.2f} {y2:.2f} l S")
        self.commands.append("Q")

    def draw_rect(self, x, y, w, h, fill_rgb=None, stroke_rgb=None, stroke_width=1.0):
        self.commands.append("q")
        if stroke_rgb:
            r, g, b = stroke_rgb
            self.commands.append(f"{r:.3f} {g:.3f} {b:.3f} RG")
            self.commands.append(f"{stroke_width:.2f} w")
        if fill_rgb:
            r, g, b = fill_rgb
            self.commands.append(f"{r:.3f} {g:.3f} {b:.3f} rg")
        
        op = "B" if (fill_rgb and stroke_rgb) else ("f" if fill_rgb else "S")
        self.commands.append(f"{x:.2f} {y:.2f} {w:.2f} {h:.2f} re {op}")
        self.commands.append("Q")

    def add_h1(self, title):
        self.y -= 18
        self.draw_rect(self.margin_left, self.y - 2, 4.0, 18.0, fill_rgb=(0.08, 0.35, 0.75))
        self.text(self.margin_left + 12, self.y + 1, title, font="F2", size=14, r=0.08, g=0.2, b=0.45)
        self.y -= 14
        self.draw_line(self.margin_left, self.y + 4, self.width - self.margin_right, self.y + 4, width=0.5, r=0.8, g=0.85, b=0.9)
        self.y -= 8

    def add_h2(self, title):
        self.y -= 14
        self.text(self.margin_left, self.y, title, font="F2", size=11.5, r=0.12, g=0.25, b=0.5)
        self.y -= 12

    def add_h3(self, title):
        self.y -= 10
        self.text(self.margin_left, self.y, title, font="F2", size=10, r=0.2, g=0.3, b=0.4)
        self.y -= 10

    def add_paragraph(self, text, font="F1", size=9.0, leading=11.5, r=0.15, g=0.15, b=0.15):
        words = text.split()
        char_limit = int(self.content_width / (size * 0.48))
        lines = []
        cur_line = []
        cur_len = 0
        for w in words:
            if cur_len + len(w) + 1 > char_limit:
                lines.append(" ".join(cur_line))
                cur_line = [w]
                cur_len = len(w)
            else:
                cur_line.append(w)
                cur_len += len(w) + 1
        if cur_line:
            lines.append(" ".join(cur_line))
            
        for line in lines:
            self.text(self.margin_left, self.y, line, font=font, size=size, r=r, g=g, b=b)
            self.y -= leading
        self.y -= 4

    def add_bullet(self, bold_prefix, text, size=8.8, leading=11.0):
        bullet_x = self.margin_left + 8
        text_x = self.margin_left + 22
        self.commands.append("q")
        self.draw_rect(bullet_x, self.y + 3, 3.5, 3.5, fill_rgb=(0.1, 0.4, 0.8))
        self.commands.append("Q")
        
        full_text = f"{bold_prefix} {text}"
        char_limit = int((self.content_width - 25) / (size * 0.48))
        words = full_text.split()
        lines = []
        cur_line = []
        cur_len = 0
        for w in words:
            if cur_len + len(w) + 1 > char_limit:
                lines.append(" ".join(cur_line))
                cur_line = [w]
                cur_len = len(w)
            else:
                cur_line.append(w)
                cur_len += len(w) + 1
        if cur_line:
            lines.append(" ".join(cur_line))
            
        for i, line in enumerate(lines):
            self.text(text_x, self.y, line, font="F1", size=size, r=0.15, g=0.15, b=0.15)
            self.y -= leading
        self.y -= 2

    def add_callout(self, title, text, r_bar=0.1, g_bar=0.45, b_bar=0.85):
        box_y = self.y - 48
        box_h = 44
        self.draw_rect(self.margin_left, box_y, self.content_width, box_h, fill_rgb=(0.96, 0.97, 0.99), stroke_rgb=(0.85, 0.88, 0.92), stroke_width=0.75)
        self.draw_rect(self.margin_left, box_y, 4.0, box_h, fill_rgb=(r_bar, g_bar, b_bar))
        self.text(self.margin_left + 12, box_y + 28, title, font="F2", size=9.5, r=r_bar, g=g_bar, b=b_bar)
        self.text(self.margin_left + 12, box_y + 14, text, font="F1", size=8.5, r=0.25, g=0.25, b=0.3)
        self.y = box_y - 8

    def add_code_block(self, lines, title=None):
        line_height = 10.0
        padding = 6.0
        box_h = len(lines) * line_height + padding * 2 + (12 if title else 0)
        box_y = self.y - box_h
        
        self.draw_rect(self.margin_left, box_y, self.content_width, box_h, fill_rgb=(0.95, 0.96, 0.97), stroke_rgb=(0.8, 0.83, 0.87), stroke_width=0.75)
        
        cur_y = box_y + box_h - padding - 8
        if title:
            self.text(self.margin_left + padding + 4, cur_y, title, font="F5", size=8.0, r=0.2, g=0.3, b=0.55)
            cur_y -= 12
            self.draw_line(self.margin_left, cur_y + 4, self.width - self.margin_right, cur_y + 4, width=0.5, r=0.85, g=0.87, b=0.9)
            
        for line in lines:
            self.text(self.margin_left + padding + 4, cur_y, line, font="F4", size=7.5, r=0.1, g=0.15, b=0.2)
            cur_y -= line_height
            
        self.y = box_y - 8

    def add_table(self, headers, rows, col_widths):
        row_h = 14.0
        table_h = (len(rows) + 1) * row_h
        table_y = self.y - table_h
        
        # Header background
        self.draw_rect(self.margin_left, self.y - row_h, self.content_width, row_h, fill_rgb=(0.15, 0.28, 0.5), stroke_rgb=(0.15, 0.28, 0.5))
        
        cur_x = self.margin_left
        for h, w in zip(headers, col_widths):
            self.text(cur_x + 5, self.y - row_h + 4, h, font="F2", size=8.0, r=1.0, g=1.0, b=1.0)
            cur_x += w
            
        cur_y = self.y - row_h * 2
        for r_idx, row in enumerate(rows):
            fill = (0.97, 0.98, 0.99) if r_idx % 2 == 1 else (1.0, 1.0, 1.0)
            self.draw_rect(self.margin_left, cur_y, self.content_width, row_h, fill_rgb=fill, stroke_rgb=(0.85, 0.87, 0.9), stroke_width=0.5)
            cur_x = self.margin_left
            for val, w in zip(row, col_widths):
                self.text(cur_x + 5, cur_y + 4, str(val), font="F1", size=7.8, r=0.15, g=0.15, b=0.2)
                cur_x += w
            cur_y -= row_h
            
        self.y = table_y - 8

    def render(self):
        return "\n".join(self.commands)
