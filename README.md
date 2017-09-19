# polyv-upload
上传插件

------------------

使用文档： 

[toc]

未完善。
入门使用文档可参考POLYV官网的[使用文档](http://dev.polyv.net/2013/07/polyvuploadplugin/)。

# 上传参数options
- `sign`: 根据将secretkey和13位的毫秒级时间戳按照顺序拼凑起来的字符串进行MD5计算得到的值
- `userid`: 
- `hash`: 根据将13位的毫秒级时间戳和writeToken按照顺序拼凑起来的字符串进行MD5计算得到的值
- `ts`
- `cataid`: 上传目录id
- `luping`(optional): 开启视频课件优化处理，对于上传录屏类视频清晰度有所优化；
- `extra`(optional): 
```javascript
{
    state, // 自定义参数，可以通过回调通知接口抓取到该字段
    keepsource, // 源文件播放（不对源文件进行编码）
}
```
- `response`(optional): function，返回指定视频的信息时的回调函数



# 方法
- `update(data)`: 用于更新ts、hash、sign3个信息
- `closeWrap()`: 关闭插件
- `openWrap()`: 打开插件



# 监听的事件
1. `onCancle(file)`
    - 触发条件：Triggered when a file is removed from the queue (but not if it’s replaced during a select operation).
    - 参数：file
        The file object being cancelled
2. `onClearQueue(fileArr)`
    - 触发条件：This event is triggered when the cancel method is called with an ‘*’ as the argument.
    - 参数：fileArr
        The queue of items that are being cancelled.
3. `uploadSuccess(queueData)`
    - 触发条件：当上传列表中的所有视频都已处理完毕时触发。
    - 参数：
        1. queueData
            The queueData object containing information about the queue:
                1.uploadsSuccessful array
                    The files that were successfully uploaded
                2. uploadsErrored array（暂时不做）
                    The files that returned an error
4. `uploadFail(err)`
    - 触发条件：上传中某个文件上传失败
    - 参数data：
    `{data: errStr}`

4. `onSelect(file)`
    - 触发条件：Triggered for each file that is selected from the browse files dialog and added to the queue.
    - 参数： flie
5. `onUploadComplete(file)`
    - 触发条件：Triggered once for each file when uploading is completed whether it was successful or returned an error.（上传出错时没做处理）
    - 参数： flie
6. `onUploadProgress(file, bytesUploaded, bytesTotal, totalBytesUploaded, totalBytesTotal)`
    - 触发条件：Triggered each time the progress of a file upload is updated.
    - 参数：
        - file
            The file object being uploaded
        - bytesUploaded
            The number of bytes of the file that have been uploaded
        - bytesTotal
            The total number of bytes of the file
        - totalBytesUploaded
            The total number of bytes uploaded in the current upload operation (all files)
        - totalBytesTotal
            The total number of bytes to be uploaded (all files)
7. `onUploadStart(file)`
    - 触发条件：Triggered immediate before a file is uploaded.
    - 参数：file

注意：返回的file都不是file对象本身，而是包含file部分属性值的对象。可以得到的值如下：
```javascript
{
bytesUploaded: 0,
desc:"",
fileName:"Wildlife11.wmv",
fileSize: 123456,
fileType:"video/x-ms-wmv",
key:"1505110459152_Wildlife11.wmv",
progress:0,
title:"Wildlife11"
}
```


