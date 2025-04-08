from PyPDF2 import PdfWriter, PdfReader
from lib import writeTextOnSummary, savePdf, img2BytesArr, img2Text, pdf2Images, cropNumber, cropTitle, chooseFile
import os
from colorama import Fore, Style

pdfPath = chooseFile()
if pdfPath == "":
    print(Fore.RED + "/!\\ Aucun fichier PDF choisi /!\\ ")
    input()
    exit()

print(Fore.YELLOW + "-------------------------------")
print("Extraction des folios")
print("-------------------------------")
print(Style.RESET_ALL)
folios = pdf2Images(pdfPath)

print("Extraction des titres")
print("-------------------------------")
titles = [img2Text(img2BytesArr(cropTitle(image))) for image in folios[1:]] # Do not take the first image
if titles[-1].lower() != "sommaire":
    print(Fore.RED + "\n/!\\ Le folio sommaire de base n'existe pas /!\\ ")
    input()
    exit()
titles = ["PAGE DE GARDE", "SOMMAIRE"] + titles[:-1] # Delete the last title (summary)

print("Extraction des numéros")
print("-------------------------------")
numbers = [img2Text(img2BytesArr(cropNumber(image))) for image in folios[1:-1]] # Do not take the first and the last images 
numbers = ["000", "001"] + numbers 

#Fix rotation
fixRotation = False
fixRotationAngle = 270
if fixRotation:
    pdf = PdfReader(open(pdfPath, "rb"))
    savePdf(pdf, tmpPath)

print("Génération du folio sommaire")
print("-------------------------------")
pdf = PdfReader(open(tmpPath if fixRotation else pdfPath, "rb"))
xStartNumber = 130
xStartTitle = 220
yStart = 125
gap = 54
rowsCount = 25
for index, number in enumerate(numbers):
    xShift = 1070 if index > (rowsCount - 1) else 0
    _gap = gap * (index % rowsCount) 
    if index != 0 and ((index+1) % rowsCount) == 0:
        _gap = _gap - 10
    writeTextOnSummary(pdf, xStartNumber + xShift, yStart + _gap, number)
    writeTextOnSummary(pdf, xStartTitle + xShift, yStart + _gap, titles[index])
print("Export du PDF")
print("-------------------------------")
outputPdf = PdfWriter()
outputPdf.add_page(pdf.pages[0]) #First page 
outputPdf.add_page(pdf.pages[-1]) #Summary
for page in pdf.pages[1:-1]:
    outputPdf.add_page(page)
with open(pdfPath, "wb") as outputStream:
    outputPdf.write(outputStream)

print(Fore.GREEN + "\nOpération terminée")
input() # Wait before close
