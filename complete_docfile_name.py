"""
    Compléter les noms des fichiers de docs tchniques dans un dossier
    Le suffixe "_DATASHEET_[LANGUE]" est ajouté
    Si le nom du fichier contient le mot "CERTIFICATION", uniquement la langue est ajoutée
    Exemples :
        - ALBL8RPS24100.pdf deviendra ALBL8RPS24100_DATASHEET_FR.pdf
            (_FR si la langue dans le fichier est le français)
        - ALBL8RPS24100_CERTIFICATION.pdf deviendra ALBL8RPS24100_CERTIFICATION_FR.pdf
"""
from langdetect import detect_langs
from pdf2image import convert_from_path, convert_from_bytes
from PyPDF2 import PdfReader
import os
from collections import Counter

def get_lang(texts):
    texts_sorted = sorted(texts, key=len, reverse=True)
    langs = []
    for text in texts_sorted[:20]:
        try:
            langs_infos = detect_langs(text)
            know_languages_infos = [lang_info for lang_info in langs_infos if lang_info.lang in KNOWN_LANGUAGES]
            know_languages_infos_sorted = sorted(know_languages_infos, key=lambda item:item.prob, reverse=True)
            if len(know_languages_infos) > 0:
                langs.append(know_languages_infos_sorted[0].lang.upper())
        except: 
            pass
    return '' if len(langs) == 0 else Counter(langs).most_common(1)[0][0]

KNOWN_LANGUAGES = ["fr", "en", "de"]

dirPath = ""
while dirPath != "exit":
    dirPath = input("Dossier : ")
    if dirPath == "exit":
        break
    files = os.listdir(dirPath)
    for fileName in files:
        filePath = dirPath+"/"+fileName
        # creating a pdf reader object
        try:
            reader = PdfReader(filePath)
            if len(reader.pages) > 0:
                page = reader.pages[0]
                if page.extract_text().strip() != '':
                    texts = page.extract_text().split("\n")
                    lang = get_lang(texts)
                    (fileBaseName, fileExtension) = os.path.splitext(fileName)
                    if "CERTIFICATION" in fileBaseName.upper():
                        newFileName = fileBaseName.upper() + "_" + lang + fileExtension
                    elif "_DATASHEET_" not in fileBaseName.upper():
                        newFileName = fileBaseName.upper() + "_DATASHEET_" + lang + fileExtension
                    else:
                        newFileName = fileBaseName.upper() + fileExtension
                    os.rename(filePath, dirPath+"/"+newFileName)
        except:
            pass
    print("Terminé")