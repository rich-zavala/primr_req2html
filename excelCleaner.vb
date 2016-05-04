Sub thevalues()
For Each ws In Worksheets
    other = ws.Name
    Worksheets(other).Activate
    Range("A1").Select
    Range(Selection, ActiveCell.SpecialCells(xlLastCell)).Select
    Selection.Copy
    Selection.PasteSpecial Paste:=xlPasteValues, Operation:=xlNone, _
    SkipBlanks:=True, Transpose:=False
    Application.CutCopyMode = True
    Range("A1").Select
    Range(Selection, ActiveCell.SpecialCells(xlLastCell)).Select
    
    'Turn off screen updates to improve performance
    Application.ScreenUpdating = False
     
     'Clear formatting
    Selection.ClearFormats
     
     'If you would like to restore the font to the application default as defined in
     'Tools|Options|General, remove the ' from the beginning of the line below
     'Selection.Font.Name = Application.StandardFont
     
     'Restore screen updates to display changes
    Application.ScreenUpdating = True
    
    Next ws
End Sub

