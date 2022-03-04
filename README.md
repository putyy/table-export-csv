## laravel-admin extension

### 安装
```shell
composer require putyy/table-export-csv

php artisan vendor:publish --provider="Pt\WebExportCsv\WebExportCsvServiceProvider"
```

### js导出csv封装， 使用如下
```php
...
$grid->tools(function ($tools) {
    // 1导出当前页 2导出全部
    $tools->append(new WebExportCsvTool(1));
    $func = <<<HTML
        <script type="application/javascript">
            function currentPageColumnHandle(td){
                return "666";
            }
        </script>
    HTML;
    $tools->append(new WebExportCsvTool(2, $func));
});
...
```
