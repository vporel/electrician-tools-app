from pdf2image import convert_from_path
from PIL import Image
import easyocr
import io
from PyPDF2 import PdfWriter, PdfReader, Transformation
from reportlab.pdfgen import canvas #Install reportlab
from reportlab.lib.pagesizes import A4, landscape
import time
import tkinter as tk
from tkinter import filedialog

def img2BytesArr(image: Image): #Image to bytes array
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format="png")
    return img_byte_arr.getvalue()

def pdf2Images(pdfPath):
    # Store Pdf with convert_from_path function
    return convert_from_path(pdfPath, poppler_path = r'poppler-24.02.0/Library/bin')

def cropNumber(image: Image):
    if image.width < image.height:
        image = image.rotate(-90, expand=True)
    return image.crop((2160, 1543, 2280, 1572))
    
def cropTitle(image: Image):
    if image.width < image.height:
        image = image.rotate(-90, expand=True)
    return image.crop((790, 1515, 1545, 1625))

reader = None
def img2Text(imgBytesArray):
    global reader
    if reader is None:
        reader = easyocr.Reader(['fr']) #Initialize the reader
    text = reader.readtext(imgBytesArray, detail = 0, paragraph=True)
    text = " ".join(text)
    text = text.strip() #Remove the spaces at the start and the end
    # Correct some possible errors
    text = text.replace("  ", " ").replace("  ", " ")
    text = text.replace("ALIMENTA TION", "ALIMENTATION").replace("DISTRIBU TION", "DISTRIBUTION")
    text = text.replace("SIGNALISA TION", "SIGNALISATION").replace("IMPLANTA TION", "IMPLANTATION")
    text = text.replace("ENTREES TORI", "ENTREES TOR").replace("ENTREES TOFI", "ENTREES TOR")
    text = text.replace("SORTIES TORI", "SORTIES TOR").replace("SORTIES TOFI", "SORTIES TOR")
    text = text.replace(" /2", " 1/2")
    if text.startswith("ELECOMMANDE"):
        text = text.replace("ELECOMMANDE", "TELECOMMANDE")
    if text.startswith("ELESURVEILLANCE"):
        text = text.replace("ELESURVEILLANCE", "TELESURVEILLANCE")
    return text

def getPageOrientation(page):
    mediabox = page.mediabox
    if mediabox.upper_right[0] - mediabox.upper_left[0] > mediabox.upper_right[1] - mediabox.lower_right[1]:
        return 'landscape'
    else:
        return 'portrait'
     
def rotatePageIfPortrait(page):
    if getPageOrientation(page) == "portrait":
        page.rotate(-90)

def convertPixel(px):
    return px * 595 / 1650 # 595 = the max y coordinate for the canvas class, 1650 = the max y coordinate in the pixels field

def savePdf(pdf: PdfReader, outputPath):
    outputPdf = PdfWriter()
    for page in pdf.pages:
        outputPdf.add_page(page)
    with open(outputPath, "wb") as outputStream:
        outputPdf.write(outputStream)

offset = 10
def writeTextOnSummary(inputPdf: PdfReader, x, y, text):
    packet = io.BytesIO()
    can = canvas.Canvas(packet, pagesize=A4)
    can.drawString(0, 0, text)
    can.save()
    packet.seek(0)
    textPdf = PdfReader(packet)
    textPage = textPdf.pages[0]
    summaryPage = inputPdf.pages[-1]
    textPage.add_transformation(Transformation().scale(0.6).rotate(90).translate(convertPixel(y)+offset, convertPixel(x)))
    summaryPage.merge_page(textPage) #The last page is supposed to be the summary model
 
def chooseFile():
    root = tk.Tk()
    root.withdraw()
    return filedialog.askopenfilename()
    